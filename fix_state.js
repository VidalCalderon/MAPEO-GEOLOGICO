const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/FeatureFormModal.tsx', 'utf8');

const stateRegex = /const \[errors, setErrors\] = useState<any>\(\{\}\);/;
c = c.replace(
  stateRegex,
  `const [errors, setErrors] = useState<any>({});
  const [targetLayerId, setTargetLayerId] = useState('');
  const availableLayers = getAvailableLayers();

  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 250, y: window.innerHeight / 2 - 300 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = React.useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, initialX: position.x, initialY: position.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPosition({ x: dragRef.current.initialX + (e.clientX - dragRef.current.startX), y: dragRef.current.initialY + (e.clientY - dragRef.current.startY) });
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };`
);

// Also in Admin.tsx error:
let adminCode = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');
adminCode = adminCode.replace(
  /const newLayers = \[/g,
  `const newLayers: any[] = [`
);
fs.writeFileSync('frontend/src/pages/Admin.tsx', adminCode);

fs.writeFileSync('frontend/src/components/FeatureFormModal.tsx', c);
