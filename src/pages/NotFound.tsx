import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { motion, type Variants } from 'framer-motion';
import { ArrowLeft, Ghost, Home, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from '../components/Button/custom-button';

export default function NotFoundPage() {
    const navigate = useNavigate()

    const handleGoBack = () => {
        // no prior history
        if (window.history.state?.idx > 0) {
            navigate(-1)
        } else {
            navigate('/')
        }
    }

    const handleGoHome = () => {
        navigate('/')
    }

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: 'easeOut' },
        },
    }

    const floatVariants: Variants = {
        animate: {
            y: [0, -10, 0],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
            },
        },
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-green-50 dark:from-green-950 dark:via-green-900 dark:to-blue-950 flex items-center justify-center p-4">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-100 dark:bg-amber-900/10 rounded-full blur-3xl opacity-30" />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative w-full max-w-2xl"
            >
                <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl gap-3">
                    <CardContent className="p-8 md:p-12">
                        {/* Animated ghost icon */}
                        <motion.div
                            variants={itemVariants}
                            className="flex justify-center mb-6"
                        >
                            <motion.div
                                variants={floatVariants}
                                animate="animate"
                                className="relative"
                            >
                                <Ghost
                                    className="w-24 h-24 text-blue-500 dark:text-blue-400"
                                    strokeWidth={1.5}
                                />
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 0.8, 0.5],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                    className="absolute inset-0 bg-blue-400/20 dark:bg-blue-500/20 rounded-full blur-xl"
                                />
                            </motion.div>
                        </motion.div>

                        {/* 404 Text */}
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col text-center mb-6"
                        >
                            <h1 className="text-7xl md:text-8xl font-black bg-linear-to-r from-green-600 via-lime-600 to-pink-600 dark:from-green-400 dark:via-lime-400 dark:to-pink-400 bg-clip-text text-transparent tracking-tight">
                                404
                            </h1>
                            <div className="h-1 w-24 mx-auto mt-4 bg-linear-to-r from-green-500 to-lime-500 rounded-full" />
                        </motion.div>

                        {/* Message */}
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col text-center align-items-center space-y-3 mb-8"
                        >
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Page Not Found
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-sm md:text-base">
                                Oops! It seems like you've wandered off the map.
                                The page you're looking for doesn't exist or has
                                been moved.
                            </p>
                        </motion.div>

                        {/* Search bar */}
                        <motion.div variants={itemVariants} className="mb-8">
                            <div className="relative max-w-md mx-auto">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="search"
                                    placeholder="Search for something..."
                                    className="pl-10 pr-4 h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus-visible:ring-blue-500"
                                />
                            </div>
                        </motion.div>

                        {/* Action buttons */}
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-5"
                        >
                            <CustomButton
                                onClick={handleGoBack}
                                variant="secondary"
                                icon={<ArrowLeft />}
                                className="w-full flex sm:w-auto gap-2 h-11 px-6 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                Go Back
                            </CustomButton>
                            <CustomButton
                                variant={'primary'}
                                onClick={handleGoHome}
                                icon={<Home />}
                                className="w-full flex sm:w-auto gap-2 h-11 px-6 bg-linear-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-white shadow-lg shadow-blue-500/25"
                            >
                                Back to Home
                            </CustomButton>
                        </motion.div>

                        {/* Help text */}
                        <motion.p
                            variants={itemVariants}
                            className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8"
                        >
                            Need help?{' '}
                            <a
                                href="/"
                                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2"
                            >
                                Contact support
                            </a>
                        </motion.p>
                    </CardContent>
                </Card>

                {/* Error code reference */}
                <motion.div
                    variants={itemVariants}
                    className="text-center mt-6"
                >
                    <p className="text-xs text-primary-400 dark:text-primary-600 font-mono">
                        Error code: 404_NOT_FOUND
                    </p>
                </motion.div>
            </motion.div>
        </div>
    )
}
