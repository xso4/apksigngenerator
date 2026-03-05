import React, { useState } from 'react';
import { useKeyGenerator, type HashAlgorithm, type KeySize } from './hooks/useKeyGenerator';

const App: React.FC = () => {
  const {
    status,
    message,
    generate,
    downloadP12,
    downloadPk8,
    downloadX509,
    p12Buffer,
    pk8Buffer,
    x509Pem
  } = useKeyGenerator();
  const [formData, setFormData] = useState({
    alias: '114514',
    passphrase: '114514',
    password: '114514',
    notBeforeDate: '2022-02-17',
    validityYears: 114514,
    keySize: 2048 as KeySize,
    hashAlgorithm: 'SHA-256' as HashAlgorithm,
    commonName: '114514',
    countryName: '',
    stateOrProvinceName: '',
    localityName: '',
    organizationName: '',
    organizationalUnitName: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generate({
      alias: formData.alias,
      passphrase: formData.passphrase,
      password: formData.password,
      notBeforeDate: formData.notBeforeDate,
      validityYears: formData.validityYears,
      keySize: formData.keySize,
      hashAlgorithm: formData.hashAlgorithm,
      certificateInfo: {
        commonName: formData.commonName,
        countryName: formData.countryName,
        stateOrProvinceName: formData.stateOrProvinceName,
        localityName: formData.localityName,
        organizationName: formData.organizationName,
        organizationalUnitName: formData.organizationalUnitName
      }
    });
  };

  const optionButtonClass = (active: boolean) =>
    `rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
      active
        ? 'border-indigo-600 bg-indigo-600 text-white'
        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
    }`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-3 py-4">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/80">
          <div className="px-4 py-4">
            <div className="mb-3">
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">密钥与证书生成器</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-200">姓名 (CN)</label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      value={formData.commonName}
                      onChange={(e) => setFormData({ ...formData, commonName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-200">密码 (用于加密P12)</label>
                    <input
                      type="password"
                      required
                      placeholder="用于 P12 加密"
                      className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-200">别名 (FriendlyName)</label>
                    <input
                      type="text"
                      required
                      placeholder="不参与签名，仅用于标记"
                      className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
                      value={formData.alias}
                      onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-200">口令 (用于生成密钥对)</label>
                    <input
                      type="text"
                      required
                      placeholder="用于底层密钥对生成"
                      className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      value={formData.passphrase}
                      onChange={(e) => setFormData({ ...formData, passphrase: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-200">生效日期 (UTC)</label>
                    <input
                      type="date"
                      required
                      className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      value={formData.notBeforeDate}
                      onChange={(e) => setFormData({ ...formData, notBeforeDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-200">有效期 (年)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="999999"
                      className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      value={formData.validityYears}
                      onChange={(e) => setFormData({ ...formData, validityYears: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2 dark:border-slate-800">
                <div className="mb-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  密钥算法：RSA，私钥加密算法：AES-256
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">密钥长度</span>
                    <button type="button" className={optionButtonClass(formData.keySize === 2048)} onClick={() => setFormData({ ...formData, keySize: 2048 })}>
                      2048
                    </button>
                    <button type="button" className={optionButtonClass(formData.keySize === 3072)} onClick={() => setFormData({ ...formData, keySize: 3072 })}>
                      3072
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">签名哈希</span>
                    <button type="button" className={optionButtonClass(formData.hashAlgorithm === 'SHA-256')} onClick={() => setFormData({ ...formData, hashAlgorithm: 'SHA-256' })}>
                      SHA-256
                    </button>
                    <button type="button" className={optionButtonClass(formData.hashAlgorithm === 'SHA-384')} onClick={() => setFormData({ ...formData, hashAlgorithm: 'SHA-384' })}>
                      SHA-384
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2 dark:border-slate-800">
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">国家 (C)</label>
                    <input
                      type="text"
                      placeholder="ISO国家代码"
                      className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
                      value={formData.countryName}
                      onChange={(e) => setFormData({ ...formData, countryName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">省/区域 (ST)</label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      value={formData.stateOrProvinceName}
                      onChange={(e) => setFormData({ ...formData, stateOrProvinceName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">市/地区 (L)</label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      value={formData.localityName}
                      onChange={(e) => setFormData({ ...formData, localityName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">组织名 (O)</label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">组织单位 (OU)</label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      value={formData.organizationalUnitName}
                      onChange={(e) => setFormData({ ...formData, organizationalUnitName: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'processing'}
                className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'processing' ? '生成中...' : '开始生成密钥'}
              </button>
            </form>

            {status === 'processing' && (
              <div className="mt-3 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                <div className="h-3.5 w-3.5 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                <span>{message || '处理中...'}</span>
              </div>
            )}

            {status === 'success' && (
              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-xs text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-200">
                <span>生成成功</span>
                <div className="flex flex-wrap gap-2">
                  {pk8Buffer && (
                    <button
                      onClick={() => downloadPk8(formData.alias)}
                      className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
                    >
                      下载 {formData.alias}.pk8
                    </button>
                  )}
                  {x509Pem && (
                    <button
                      onClick={() => downloadX509(formData.alias)}
                      className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
                    >
                      下载 {formData.alias}.x509.pem
                    </button>
                  )}
                  {p12Buffer && (
                    <button
                      onClick={() => downloadP12(formData.alias)}
                      className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
                    >
                      下载 {formData.alias}.p12
                    </button>
                  )}
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-red-200 bg-red-50 px-2.5 py-2 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200">
                <span>{message || '生成失败'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
