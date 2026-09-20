import sys

file_path = 'd:/MAPEO-GEOLOGICO/frontend/src/index.css'
with open(file_path, 'a', encoding='utf-8') as f:
    f.write('''

/* Custom Scrollbar for Widgets */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent; 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #c1c1c1; 
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8; 
}
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 transparent;
}
''')
print("Added scrollbar CSS")
