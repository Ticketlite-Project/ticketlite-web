import { motion } from 'framer-motion'

const RippleLoader = () => {
    const cells = [
        { d: 0, color: '#00FF87' },
        { d: 0.1, color: '#0CFD95' },
        { d: 0.2, color: '#17FBA2' },
        { d: 0.1, color: '#23F9B2' },
        { d: 0.2, color: '#30F7C3' },
        { d: 0.2, color: '#3DF5D4' },
        { d: 0.3, color: '#45F4DE' },
        { d: 0.3, color: '#53F1F0' },
        { d: 0.4, color: '#60EFFF' },
    ]

    return (
        <div
            className="flex flex-wrap"
            style={{ width: '166px', height: '166px' }}
        >
            {cells.map((cell, index) => (
                <motion.div
                    key={index}
                    className="box-border rounded-sm"
                    style={{
                        width: '52px',
                        height: '52px',
                        margin: '1px',
                    }}
                    initial={{ backgroundColor: 'transparent' }}
                    animate={{
                        backgroundColor: [
                            'transparent',
                            cell.color,
                            'transparent',
                            'transparent',
                        ],
                    }}
                    transition={{
                        duration: 1.5,
                        delay: cell.d,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        times: [0, 0.3, 0.6, 1],
                    }}
                />
            ))}
        </div>
    )
}

export default RippleLoader
