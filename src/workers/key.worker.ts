/// <reference lib="webworker" />
import forge from 'node-forge';

const bytesToArrayBuffer = (bytes: string) => {
  const uint8Array = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    uint8Array[i] = bytes.charCodeAt(i);
  }
  return uint8Array.buffer;
};

const utf8 = (value: string) => forge.util.encodeUtf8(value);

const sha256Bytes = (bytes: string) => {
  const md = forge.md.sha256.create();
  md.update(bytes);
  return md.digest().getBytes();
};

const deriveSeed = (password: string) => {
  const step1 = sha256Bytes(utf8(`seed:v1|${password}`));
  const step2 = sha256Bytes(step1 + utf8('|seed:v2'));
  return step2;
};

const createDeterministicPrng = (seedBytes: string) => {
  let counter = 0;
  return {
    getBytesSync: (count: number) => {
      let out = '';
      while (out.length < count) {
        counter += 1;
        const hmac = forge.hmac.create();
        hmac.start('sha256', seedBytes);
        hmac.update(utf8(`ctr:${counter}`));
        out += hmac.digest().getBytes();
      }
      return out.slice(0, count);
    }
  };
};

const parseUtcDate = (dateValue: string) => {
  const parts = dateValue.split('-').map((value) => parseInt(value, 10));
  if (parts.length !== 3 || parts.some((value) => Number.isNaN(value))) {
    throw new Error('生效日期无效');
  }
  const [year, month, day] = parts;
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
};

self.onmessage = async (e: MessageEvent) => {
  const {
    alias,
    passphrase,
    password,
    validityYears,
    notBeforeDate,
    keySize,
    hashAlgorithm,
    certificateInfo
  } = e.data;

  try {
    const seedBytes = deriveSeed(passphrase);
    const prng = createDeterministicPrng(seedBytes);
    const originalGetBytesSync = forge.random.getBytesSync;
    forge.random.getBytesSync = prng.getBytesSync;

    try {
      self.postMessage({ status: 'generating_keys', message: '正在生成密钥对...' });
      const keys = forge.pki.rsa.generateKeyPair({ bits: keySize, prng });

      self.postMessage({ status: 'creating_certificate', message: '正在创建自签名证书...' });
      const cert = forge.pki.createCertificate();
      cert.publicKey = keys.publicKey;
      const serialSeed = sha256Bytes(seedBytes + utf8('|serial'));
      cert.serialNumber = forge.util.bytesToHex(serialSeed).slice(0, 32);
      cert.validity.notBefore = parseUtcDate(notBeforeDate);
      cert.validity.notAfter = new Date(cert.validity.notBefore.getTime());
      cert.validity.notAfter.setUTCFullYear(cert.validity.notBefore.getUTCFullYear() + (validityYears || 1));

      const attrs = [
        { name: 'countryName', value: certificateInfo.countryName || '' },
        { name: 'stateOrProvinceName', value: certificateInfo.stateOrProvinceName || '' },
        { name: 'localityName', value: certificateInfo.localityName || '' },
        { name: 'organizationName', value: certificateInfo.organizationName || '' },
        { name: 'organizationalUnitName', value: certificateInfo.organizationalUnitName || '' },
        { name: 'commonName', value: certificateInfo.commonName || '' }
      ].filter((attr) => attr.value);

      cert.setSubject(attrs);
      cert.setIssuer(attrs);

      const md = hashAlgorithm === 'SHA-384' ? forge.md.sha384.create() : forge.md.sha256.create();
      cert.sign(keys.privateKey, md);

      self.postMessage({ status: 'packing_outputs', message: '正在生成 PK8、X.509 与 P12...' });
      const privateKeyAsn1 = forge.pki.privateKeyToAsn1(keys.privateKey);
      const pkcs8Asn1 = forge.pki.wrapRsaPrivateKey(privateKeyAsn1);
      const pk8Der = forge.asn1.toDer(pkcs8Asn1).getBytes();
      const pk8Buffer = bytesToArrayBuffer(pk8Der);

      const x509Pem = forge.pki.certificateToPem(cert);

      const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
        keys.privateKey,
        [cert],
        password,
        { friendlyName: alias, algorithm: 'aes256' }
      );
      const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
      const p12Buffer = bytesToArrayBuffer(p12Der);

      self.postMessage(
        {
          status: 'success',
          data: {
            p12Buffer,
            pk8Buffer,
            x509Pem
          }
        },
        [p12Buffer, pk8Buffer]
      );
    } finally {
      forge.random.getBytesSync = originalGetBytesSync;
    }
  } catch (error: any) {
    self.postMessage({ status: 'error', message: error.message });
  }
};
