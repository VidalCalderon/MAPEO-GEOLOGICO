import re

with open('frontend/src/components/DraggableWidget.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace minWidth/width logic to clamp to window.innerWidth
content = content.replace("minWidth: isMinimized ? 'auto' : '250px',", "minWidth: isMinimized ? 'auto' : 'min(250px, 90vw)',\\n        maxWidth: 'calc(100vw - 20px)',")

# Check if the start position needs clamping
content = content.replace('if (newY < 0) newY = 0;', 'if (newY < 0) newY = 0;\\n      if (newY > window.innerHeight - 50) newY = window.innerHeight - 50;')
content = content.replace('if (newX < 0) newX = 0;', 'if (newX < 0) newX = 0;\\n      if (newX > window.innerWidth - 100) newX = window.innerWidth - 100;')

with open('frontend/src/components/DraggableWidget.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
