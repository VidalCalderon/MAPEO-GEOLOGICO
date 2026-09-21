const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/MapComponent.tsx', 'utf8');

c = c.replace(/, MousePointer2, Trash2, Edit \} from "lucide-react"/, ', Edit } from "lucide-react"');

fs.writeFileSync('frontend/src/components/MapComponent.tsx', c);
