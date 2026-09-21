import sys

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Make the header text responsive
content = content.replace('text-xl tracking-wide', 'text-sm md:text-xl tracking-wide truncate max-w-[200px] md:max-w-none')

# Make the toolbar responsive
content = content.replace('className="h-12 bg-white border-b border-gray-200 flex items-center justify-end px-4 gap-3 z-30 shrink-0 shadow-sm text-sm"', 'className="h-auto min-h-[3rem] py-1.5 bg-white border-b border-gray-200 flex flex-wrap items-center justify-end px-2 md:px-4 gap-x-2 md:gap-x-3 gap-y-1 z-30 shrink-0 shadow-sm text-xs md:text-sm"')

# Make buttons slightly smaller on mobile
content = content.replace('className="flex items-center gap-1 bg-gray-50 rounded px-3 py-1.5 cursor-pointer hover:bg-gray-100 border border-gray-300 text-gray-700 font-medium transition-colors"', 'className="flex items-center gap-1 bg-gray-50 rounded px-2 md:px-3 py-1 md:py-1.5 cursor-pointer hover:bg-gray-100 border border-gray-300 text-gray-700 font-medium transition-colors"')

# For Add Tool buttons
content = content.replace('className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left text-gray-700"', 'className="flex items-center gap-2 px-3 md:px-4 py-2 hover:bg-gray-50 text-left text-gray-700"')

# Fix Admin sidebar
content = content.replace('className="w-80 bg-white border-r border-gray-200 flex flex-col z-[30] shrink-0"', 'className="absolute md:relative w-64 md:w-80 h-full bg-white border-r border-gray-200 flex flex-col z-[40] shrink-0 transform transition-transform left-0 top-0"')

with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
