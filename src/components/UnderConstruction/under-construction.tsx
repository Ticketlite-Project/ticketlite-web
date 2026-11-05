import { cn } from '@/src/mock/utils'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Hammer, Mail, Sparkles, Wrench } from 'lucide-react'
import { CustomButton } from '../Button/custom-button'

type Props = {
    title?: string
    description?: string
    progress?: number // 0–100
    backHref?: string // default "/"
    backLabel?: string // default "Back to Home"
    contactHref?: string // mailto: or /contact
    contactLabel?: string // default "Contact Support"
    className?: string
    showProgress?: boolean // default true
    eta?: string // optional "Coming March 2026"
}

export function UnderConstruction({
    title = "We're building something great",
    description = 'This page is currently under construction. Our team is working hard to bring it to life — check back soon.',
    progress = 65,
    backHref = '/',
    backLabel = 'Back to Home',
    contactHref = 'mailto:support@example.com',
    contactLabel = 'Contact Support',
    className,
    showProgress = true,
    eta,
}: Readonly<Props>) {
    const prefersReduced = useReducedMotion()
    const clamp = Math.max(0, Math.min(100, Math.round(progress)))

    const fade = prefersReduced
        ? {}
        : {
              initial: { opacity: 0, y: 12 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.5, ease: 'easeOut' as const },
          }

    return (
        <section
            className={cn(
                'relative flex min-h-[calc(100vh-4rem)] w-full items-center justify-center overflow-hidden px-4 py-16',
                className
            )}
            aria-labelledby="uc-title"
        >
            {/* Background flourishes */}
            <BackgroundBlobs />

            <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center text-center">
                {/* Animated illustration */}
                <Illustration animate={!prefersReduced} />

                {/* Badge */}
                <motion.div
                    {...fade}
                    transition={{ ...fade.transition, delay: 0.1 }}
                >
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span>Under Construction</span>
                        {eta && (
                            <>
                                <span className="text-muted-foreground/50">
                                    •
                                </span>
                                <span>{eta}</span>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Title */}
                <motion.h1
                    id="uc-title"
                    {...fade}
                    transition={{ ...fade.transition, delay: 0.2 }}
                    className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                >
                    {title}
                </motion.h1>

                {/* Description */}
                <motion.p
                    {...fade}
                    transition={{ ...fade.transition, delay: 0.3 }}
                    className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base"
                >
                    {description}
                </motion.p>

                {/* Progress */}
                {showProgress && (
                    <motion.div
                        {...fade}
                        transition={{ ...fade.transition, delay: 0.4 }}
                        className="mt-8 w-full max-w-md"
                    >
                        <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
                            <span>Progress</span>
                            <span className="tabular-nums text-foreground">
                                {clamp}%
                            </span>
                        </div>
                        <div
                            className="h-2 w-full overflow-hidden rounded-full bg-muted"
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={clamp}
                            aria-label="Construction progress"
                        >
                            <motion.div
                                initial={
                                    prefersReduced
                                        ? { width: `${clamp}%` }
                                        : { width: 0 }
                                }
                                animate={{ width: `${clamp}%` }}
                                transition={
                                    prefersReduced
                                        ? { duration: 0 }
                                        : {
                                              duration: 1.2,
                                              delay: 0.6,
                                              ease: [0.22, 1, 0.36, 1],
                                          }
                                }
                                className="h-full rounded-full bg-linear-to-r from-primary to-primary/70"
                            />
                        </div>
                    </motion.div>
                )}

                {/* Actions */}
                <motion.div
                    {...fade}
                    transition={{ ...fade.transition, delay: 0.5 }}
                    className="mt-10 flex flex-col gap-3 sm:flex-row"
                >
                    <CustomButton
                        to={backHref}
                        icon={<ArrowLeft className="mr-2 h-4 w-4" />}
                        variant="primary"
                        className="w-full flex items-center"
                    >
                        {backLabel}
                    </CustomButton>
                    <CustomButton
                        icon={<Mail className="mr-2 h-4 w-4" />}
                        to={contactHref}
                        variant="secondary"
                        className="w-full flex items-center"
                    >
                        {contactLabel}
                    </CustomButton>
                </motion.div>
            </div>
        </section>
    )
}

/* ----------------------------- Illustration ----------------------------- */

function Illustration({ animate }: Readonly<{ animate: boolean }>) {
    const float = animate
        ? {
              y: [0, -8, 0],
              transition: {
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut' as const,
              },
          }
        : {}
    const rotateSlow = animate
        ? {
              rotate: [0, 8, -8, 0],
              transition: {
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut' as const,
              },
          }
        : {}
    const rotateReverse = animate
        ? {
              rotate: [0, -12, 12, 0],
              transition: {
                  duration: 7,
                  repeat: Infinity,
                  ease: 'easeInOut' as const,
              },
          }
        : {}

    return (
        <div className="relative mb-8 h-40 w-40 sm:h-48 sm:w-48" aria-hidden>
            {/* Glow */}
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl" />

            {/* Ground line */}
            <div className="absolute bottom-0 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-border" />

            {/* Main hammer card */}
            <motion.div
                animate={float}
                className="absolute inset-x-0 top-4 mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border border-border bg-background shadow-sm sm:h-28 sm:w-28"
            >
                <motion.div animate={rotateSlow}>
                    <Hammer
                        className="h-10 w-10 text-primary sm:h-12 sm:w-12"
                        strokeWidth={1.5}
                    />
                </motion.div>
            </motion.div>

            {/* Floating wrench — left */}
            <motion.div
                animate={float}
                transition={{ ...float.transition, delay: 0.3 }}
                className="absolute -left-1 top-1 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background shadow-sm sm:h-14 sm:w-14"
            >
                <motion.div animate={rotateReverse}>
                    <Wrench
                        className="h-5 w-5 text-primary/80 sm:h-6 sm:w-6"
                        strokeWidth={1.5}
                    />
                </motion.div>
            </motion.div>

            {/* Floating dots — right */}
            <motion.div
                animate={
                    animate
                        ? {
                              opacity: [0.4, 1, 0.4],
                              transition: { duration: 2.5, repeat: Infinity },
                          }
                        : {}
                }
                className="absolute right-0 top-8 h-3 w-3 rounded-full bg-primary/60"
            />
            <motion.div
                animate={
                    animate
                        ? {
                              opacity: [1, 0.4, 1],
                              transition: { duration: 3, repeat: Infinity },
                          }
                        : {}
                }
                className="absolute bottom-8 right-3 h-2 w-2 rounded-full bg-primary/40"
            />
        </div>
    )
}

/* ----------------------------- Background ------------------------------ */

function BackgroundBlobs() {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
        >
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                }}
            />
        </div>
    )
}
