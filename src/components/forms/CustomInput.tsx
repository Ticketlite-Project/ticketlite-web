import { Eye, EyeOff } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'
import { forwardRef, useId, useState } from 'react'
import { cn } from '../../lib/utils'

interface CustomInputProps extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size'
> {
    label: string
    error?: string
    prefix?: string
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
    ({ label, error, type, id, name, className, prefix, ...props }, ref) => {
        const generatedId = useId()
        const inputId = id ?? name ?? generatedId
        const errorId = `${inputId}-error`

        const [showPassword, setShowPassword] = useState(false)
        const isPassword = type === 'password'

        return (
            <div className="w-full">
                <label
                    htmlFor={inputId}
                    className="mb-2 block text-sm font-semibold text-foreground"
                >
                    {label}
                </label>

                <div className="relative">
                    {prefix && (
                        <span className="absolute inset-y-0 left-0 flex items-center border-r border-slate-200 px-3 text-xs text-slate-800">
                            {prefix}
                        </span>
                    )}

                    <input
                        {...props}
                        ref={ref}
                        id={inputId}
                        name={name}
                        type={isPassword && showPassword ? 'text' : type}
                        aria-invalid={!!error}
                        aria-describedby={error ? errorId : undefined}
                        className={cn(
                            'w-full rounded-lg border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
                            error ? 'border-red-500' : 'border-gray-300',
                            prefix && 'pl-18',
                            isPassword && 'pr-12',
                            className
                        )}
                    />

                    {isPassword && (
                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword((previous) => !previous)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                            aria-label={
                                showPassword ? 'Hide password' : 'Show password'
                            }
                        >
                            {showPassword ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>
                    )}
                </div>

                {error && (
                    <p
                        id={errorId}
                        className="mt-1 text-xs text-red-500"
                        role="alert"
                    >
                        {error}
                    </p>
                )}
            </div>
        )
    }
)

CustomInput.displayName = 'CustomInput'

export default CustomInput
