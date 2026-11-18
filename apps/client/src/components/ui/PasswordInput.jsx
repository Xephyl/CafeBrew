import { useState } from 'react'

export function PasswordInput({ label, error, register, ...props }) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          className={`w-full rounded border px-3 py-2 pr-12 text-sm outline-none focus:border-[#6B4226] ${error ? 'border-red-500' : 'border-gray-300'}`}
          {...register}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-gray-700"
        >
          {show ? 'HIDE' : 'SHOW'}
        </button>
      </div>
      {error && <span className="text-xs text-red-500">{error.message}</span>}
    </div>
  )
}