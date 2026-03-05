import { useState, useCallback, useRef, useEffect } from 'react';

export type KeySize = 2048 | 3072;
export type HashAlgorithm = 'SHA-256' | 'SHA-384';

export interface KeyConfig {
  alias: string;
  passphrase: string;
  password: string;
  validityYears: number;
  notBeforeDate: string;
  keySize: KeySize;
  hashAlgorithm: HashAlgorithm;
  certificateInfo: {
    commonName: string;
    countryName: string;
    stateOrProvinceName: string;
    localityName: string;
    organizationName: string;
    organizationalUnitName: string;
  };
}

export const useKeyGenerator = () => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [p12Buffer, setP12Buffer] = useState<ArrayBuffer | null>(null);
  const [pk8Buffer, setPk8Buffer] = useState<ArrayBuffer | null>(null);
  const [x509Pem, setX509Pem] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const generate = useCallback((config: KeyConfig) => {
    setStatus('processing');
    setMessage('初始化 Worker...');
    setP12Buffer(null);
    setPk8Buffer(null);
    setX509Pem(null);

    workerRef.current = new Worker(new URL('../workers/key.worker.ts', import.meta.url), {
      type: 'module'
    });

    workerRef.current.onmessage = (e: MessageEvent) => {
      const { status: workerStatus, message: workerMessage, data } = e.data;

      if (workerStatus === 'success') {
        setStatus('success');
        setMessage('密钥文件生成成功！');
        setP12Buffer(data?.p12Buffer ?? null);
        setPk8Buffer(data?.pk8Buffer ?? null);
        setX509Pem(data?.x509Pem ?? null);
      } else if (workerStatus === 'error') {
        setStatus('error');
        setMessage(`错误: ${workerMessage}`);
      } else {
        setMessage(workerMessage);
      }
    };

    workerRef.current.onerror = (err) => {
      setStatus('error');
      setMessage('Worker 运行出错');
      console.error(err);
    };

    workerRef.current.postMessage(config);
  }, []);

  const downloadP12 = useCallback((filename: string) => {
    if (!p12Buffer) return;
    const blob = new Blob([p12Buffer], { type: 'application/x-pkcs12' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.p12') ? filename : `${filename}.p12`;
    a.click();
    URL.revokeObjectURL(url);
  }, [p12Buffer]);

  const downloadPk8 = useCallback((filename: string) => {
    if (!pk8Buffer) return;
    const blob = new Blob([pk8Buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.pk8') ? filename : `${filename}.pk8`;
    a.click();
    URL.revokeObjectURL(url);
  }, [pk8Buffer]);

  const downloadX509 = useCallback((filename: string) => {
    if (!x509Pem) return;
    const blob = new Blob([x509Pem], { type: 'application/x-pem-file' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.x509.pem') ? filename : `${filename}.x509.pem`;
    a.click();
    URL.revokeObjectURL(url);
  }, [x509Pem]);

  return { status, message, p12Buffer, pk8Buffer, x509Pem, generate, downloadP12, downloadPk8, downloadX509 };
};
