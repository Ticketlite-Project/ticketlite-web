import {
    ChurchIcon,
    EighthNote,
    Globe,
    GraduationCap,
    LaptopMinimal,
    LayoutGrid,
    Palette,
} from 'lucide-react'

export const CATEGORIES = [
    { id: 'all', label: 'All events', icon: <LayoutGrid /> },
    { id: 'music', label: 'Music', icon: <EighthNote /> },
    { id: 'church', label: 'Church', icon: <ChurchIcon /> },
    { id: 'campus', label: 'Campus', icon: <GraduationCap /> },
    { id: 'tech', label: 'Tech & meetups', icon: <LaptopMinimal /> },
    { id: 'sports', label: 'Sports', icon: <Globe /> },
    { id: 'arts', label: 'Arts & culture', icon: <Palette /> },
]
