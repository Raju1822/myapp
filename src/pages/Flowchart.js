
import React from "react";

/** Reusable node/card inside SVG */
const start = 0;
const end = 0;
const SvgCard = ({
    x,
    y,
    w = 3800,
    h = 240,
    title,
    lines = [],
    fill = "#ffffff",
    stroke = "#adb5bd",
    titleColor = "#212529",
}) => {
    const lineStartY = y + 40;
    const lineGap = 18;
    return (
        <g>
            <rect x={x} y={y} width={w} height={h} rx={10} fill={fill} stroke={stroke} />
            <text x={x + 12} y={y + 22} style={{ fontWeight: "bold", fill: titleColor }}>
                {title}
            </text>
            {lines.map((t, i) => (
                <text key={`${title}-line-${i}`} x={x + 12} y={lineStartY + i * lineGap} style={{ fontSize: 13 }}>
                    {t}
                </text>
            ))}
        </g>
    );
};

/** Directional arrow with marker */
const Arrow = ({ x1, y1, x2, y2, label }) => (
    <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6c757d" strokeWidth={2} markerEnd="url(#arrow-head)" />
        {label && (
            <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6} style={{ fill: "#6c757d", fontSize: 12 }}>
                {label}
            </text>
        )}
    </g>
);

/** The large flowchart built from your sketch */
const ProductFlowchartLarge = () => (
    <svg
        viewBox="0 0 1600 1000"
        role="img"
        aria-label="Team Productivity Platform Flowchart"
        style={{ width: "100%", height: "auto", border: "1px solid #ddd", borderRadius: 8 }}
    >
        {/* Arrow head definition */}
        <defs>
            <marker id="arrow-head" markerWidth={10} markerHeight={10} refX={6} refY={3} orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L6,3 z" fill="#6c757d" />
            </marker>
        </defs>

        {/* Swimlane labels */}
        <text x={start + 40} y={end + 500} style={{ fontWeight: "bold", fill: "#0d6efd" }}>Login & Routing</text>
        <text x={460} y={210} style={{ fontWeight: "bold", fill: "#0d6efd" }}>Member Lane</text>
        <text x={460} y={510} style={{ fontWeight: "bold", fill: "#d08b00" }}>Manager Lane</text>
        <text x={460} y={800} style={{ fontWeight: "bold", fill: "#6f42c1" }}>Director Lane</text>

        {/* ------------------ Left: Login ------------------ */}
        <SvgCard
            x={40}
            y={520}
            w={260}
            h={120}
            title="Login Page"
            fill="#f0f7ff"
            stroke="#95c0ff"
            lines={["User enters credentials", "Role resolved → level 1/2/3", "Navigate to dashboard"]}
        />

        {/* Director note */}
        <SvgCard
            x={420}
            y={820}
            w={260}
            h={120}
            title="Director Login"
            fill="#f5edff"
            stroke="#c7aef5"
            titleColor="#6f42c1"
            lines={[
                "Has all Manager features",
                "Advanced features to be added",
                "Governance & analytics (future)"
            ]}
        />

        {/* ------------------ Member Lane ------------------ */}
        <SvgCard
            x={420}
            y={250}
            w={300}
            h={120}
            title="Member Dashboard"
            fill="#eef8ff"
            stroke="#95c0ff"
            titleColor="#0d6efd"
            lines={["After user login", "Personalized overview", "Access modules"]}
        />

        <SvgCard
            x={800}
            y={210}
            w={360}
            h={220}
            title="Member Features"
            fill="#ffffff"
            stroke="#adb5bd"
            lines={[
                "1. Member details | Team details",
                "2. Skill section (add, delete, update)",
                "3. Skill exam (get certified)",
                "4. Tasks assigned (status & progress)",
                "5. Leave management (apply, history)",
                "6. Common Review (monthly/yearly)",
            ]}
        />

        {/* Member outcomes on the right */}
        <SvgCard
            x={1250}
            y={20}
            w={280}
            h={120}
            title="Exam Outcome"
            fill="#f0fff4"
            stroke="#79c58a"
            titleColor="#198754"
            lines={["≥ 80% → Certificate generated", "Stored in user_skills.certificate"]}
        />
        <SvgCard
            x={1250}
            y={160}
            w={280}
            h={120}
            title="Tasks Monitoring"
            fill="#f0fff4"
            stroke="#79c58a"
            titleColor="#198754"
            lines={["Update task progress", "Change status: Not Started → Completed"]}
        />
        <SvgCard
            x={1250}
            y={300}
            w={280}
            h={120}
            title="Leaves & History"
            fill="#f0fff4"
            stroke="#79c58a"
            titleColor="#198754"
            lines={["Apply leave | View history", "Holidays reference available"]}
        />
        <SvgCard
            x={1250}
            y={440}
            w={280}
            h={120}
            title="CR Feedback"
            fill="#f0fff4"
            stroke="#79c58a"
            titleColor="#198754"
            lines={["Manager provides feedback", "Monthly & Yearly visibility"]}
        />

        {/* Arrows: Login → Member & outcomes */}
        <Arrow x1={310} y1={580} x2={420} y2={310} label="Member login" />
        <Arrow x1={720} y1={300} x2={800} y2={300} />
        <Arrow x1={1160} y1={310} x2={1250} y2={80} />
        <Arrow x1={1160} y1={310} x2={1250} y2={200} />
        <Arrow x1={1160} y1={310} x2={1250} y2={350} />
        <Arrow x1={1160} y1={310} x2={1250} y2={490} />
        {/* <Arrow x1={1180} y1={500} x2={1250} y2={500} /> */}

        {/* ------------------ Manager Lane ------------------ */}
        <SvgCard
            x={420}
            y={540}
            w={300}
            h={120}
            title="Manager Dashboard"
            fill="#fff6e8"
            stroke="#f0c24b"
            titleColor="#d08b00"
            lines={["After Manager login", "Team overview & actions"]}
        />

        <SvgCard
            x={800}
            y={600}
            w={360}
            h={260}
            title="Manager Features"
            fill="#ffffff"
            stroke="#adb5bd"
            lines={[
                "1. Manager details",
                "2. Task distribution details",
                "3. Task completion graphs",
                "4. Member details | Actions on member",
                "5. Leaderboard (best performer)",
                "6. Team details",
                "7. Common Review (fill ratings)",
                "8. Leave management (approve/reject)",
                "9. Question Manager (add/edit questions)"
            ]}
        />

        {/* Manager outcomes on the right */}
        <SvgCard
            x={1250}
            y={610}
            w={280}
            h={100}
            title="Best Performer"
            fill="#fff0f6"
            stroke="#e6a4c3"
            titleColor="#b0005f"
            lines={["Based on composite skill score"]}
        />
        <SvgCard
            x={1250}
            y={730}
            w={280}
            h={100}
            title="Common Review"
            fill="#fff0f6"
            stroke="#e6a4c3"
            titleColor="#b0005f"
            lines={["Monthly & Yearly ratings per employee"]}
        />
        <SvgCard
            x={1250}
            y={850}
            w={280}
            h={100}
            title="Question Manager"
            fill="#fff0f6"
            stroke="#e6a4c3"
            titleColor="#b0005f"
            lines={["Create/edit questions per skill"]}
        />

        {/* Arrows: Login → Manager → outcomes */}
        {/* <Arrow x1={300} y1={120} x2={360} y2={120} /> */}
        <Arrow x1={310} y1={580} x2={370} y2={580} label="Manager login" />
        <Arrow x1={720} y1={640} x2={800} y2={640} />
        <Arrow x1={1160} y1={750} x2={1250} y2={630} />
        <Arrow x1={1160} y1={750} x2={1250} y2={750} />
        <Arrow x1={1160} y1={750} x2={1250} y2={870} />

        {/* ------------------ Director path ------------------ */}
        <Arrow x1={310} y1={580} x2={420} y2={880} label="Director login" />
        {/* <Arrow x1={300} y1={120} x2={300} y2={420} />
    <Arrow x1={300} y1={420} x2={300} y2={420} />
    <Arrow x1={300} y1={420} x2={360} y2={420} /> */}

    </svg>
);

export default ProductFlowchartLarge;

































// import React, { useEffect, useRef, useState } from "react";

// /** ====== Configurable canvas sizes for modes ====== */
// const SIZES = {
//   desktop: { width: 1200, height: 900 },  // ↑ taller to avoid crowding
//   tablet:  { width: 900,  height: 1200 },
//   mobile:  { width: 420,  height: 1800 },
// };

// const GRID_SIZE = 30;          // px: snapping grid cell size
// const MIN_ZOOM  = 0.5;
// const MAX_ZOOM  = 3.0;

// /** ====== Helpers ====== */
// const snap = (v) => Math.round(v / GRID_SIZE) * GRID_SIZE;

// const rectsOverlap = (a, b, pad = 4) => {
//   return !(
//     a.x + a.w + pad < b.x ||
//     a.x > b.x + b.w + pad ||
//     a.y + a.h + pad < b.y ||
//     a.y > b.y + b.h + pad
//   );
// };

// const toBounds = (node) => ({ x: node.x, y: node.y, w: node.w, h: node.h });

// /** Spiral search around (gx, gy) grid coords to find nearest non-overlapping slot */
// const findFreeSlot = (nodes, idx, gx, gy, canvasW, canvasH) => {
//   const subject = nodes[idx];
//   const sx = gx * GRID_SIZE;
//   const sy = gy * GRID_SIZE;
//   const dirs = [
//     [1, 0], [0, 1], [-1, 0], [0, -1], // R, D, L, U
//     [1, 1], [-1, 1], [-1, -1], [1, -1] // diagonals
//   ];

//   const tryPos = (x, y) => {
//     const tb = { x, y, w: subject.w, h: subject.h };
//     if (
//       tb.x < 0 || tb.y < 0 ||
//       tb.x + tb.w > canvasW ||
//       tb.y + tb.h > canvasH
//     ) return false;
//     for (let j = 0; j < nodes.length; j++) {
//       if (j === idx) continue;
//       if (rectsOverlap(tb, toBounds(nodes[j]))) return false;
//     }
//     return true;
//   };

//   const snappedX = snap(sx);
//   const snappedY = snap(sy);
//   if (tryPos(snappedX, snappedY)) return { x: snappedX, y: snappedY };

//   const maxRadius = 30; // wider search
//   for (let r = 1; r <= maxRadius; r++) {
//     for (let d = 0; d < dirs.length; d++) {
//       const nx = snappedX + dirs[d][0] * r * GRID_SIZE;
//       const ny = snappedY + dirs[d][1] * r * GRID_SIZE;
//       if (tryPos(nx, ny)) return { x: nx, y: ny };
//     }
//   }
//   // Fallback clamp
//   return {
//     x: Math.max(0, Math.min(snappedX, canvasW - subject.w)),
//     y: Math.max(0, Math.min(snappedY, canvasH - subject.h)),
//   };
// };

// /** ====== Node/Card rendering ====== */
// const NodeCard = ({ node, onPointerDown }) => {
//   const { id, x, y, w, h, title, lines, fill, stroke, titleColor } = node;
//   const startY = y + 40;
//   const gap = 18;
//   return (
//     <g onPointerDown={(evt) => onPointerDown(evt, id)} style={{ cursor: "grab" }}>
//       <rect x={x} y={y} width={w} height={h} rx={10} fill={fill} stroke={stroke} />
//       <text x={x + 12} y={y + 22} style={{ fontWeight: "bold", fill: titleColor || "#212529" }}>
//         {title}
//       </text>
//       {lines.map((t, i) => (
//         <text key={`${id}-line-${i}`} x={x + 12} y={startY + i * gap} style={{ fontSize: 13 }}>
//           {t}
//         </text>
//       ))}
//     </g>
//   );
// };

// /** ====== Edge/Arrow rendering ====== */
// const Edge = ({ from, to, nodes, label }) => {
//   const A = nodes.find((n) => n.id === from);
//   const B = nodes.find((n) => n.id === to);
//   if (!A || !B) return null;
//   const ax = A.x + A.w / 2;
//   const ay = A.y + A.h / 2;
//   const bx = B.x + B.w / 2;
//   const by = B.y + B.h / 2;
//   return (
//     <g>
//       <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#6c757d" strokeWidth={2} markerEnd="url(#arrow-head)" />
//       {label && (
//         <text x={(ax + bx) / 2} y={(ay + by) / 2 - 6} style={{ fill: "#6c757d", fontSize: 12 }}>
//           {label}
//         </text>
//       )}
//     </g>
//   );
// };

// const FlowchartEditor = () => {
//   const wrapperRef = useRef(null);
//   const svgRef = useRef(null);

//   // responsive mode
//   const [mode, setMode] = useState("desktop");
//   const { width: canvasW, height: canvasH } = SIZES[mode];

//   // view transforms
//   const [baseScale, setBaseScale] = useState(1);
//   const [userZoom, setUserZoom] = useState(1);
//   const [pan, setPan] = useState({ x: 0, y: 0 });

//   const computedScale = baseScale * userZoom;

//   // ====== Repositioned nodes: NO INITIAL OVERLAP ======
//   const [nodes, setNodes] = useState(() => [
//     // Login & Director (left column)
//     {
//       id: "login",
//       x: 40, y: 60, w: 300, h: 130,
//       title: "Login Page",
//       lines: ["Enter credentials", "Resolve role → level 1/2/3", "Navigate to dashboard"],
//       fill: "#f0f7ff", stroke: "#95c0ff", titleColor: "#0d6efd",
//     },
//     {
//       id: "director",
//       x: 40, y: 420, w: 300, h: 130,
//       title: "Director Login",
//       lines: ["All manager features", "Advanced analytics (future)"],
//       fill: "#f5edff", stroke: "#c7aef5", titleColor: "#6f42c1",
//     },

//     // Member lane (middle column)
//     {
//       id: "member_dash",
//       x: 420, y: 60, w: 320, h: 130,
//       title: "Member Dashboard",
//       lines: ["After user login", "Overview + modules access"],
//       fill: "#eef8ff", stroke: "#95c0ff", titleColor: "#0d6efd",
//     },
//     {
//       id: "member_features",
//       x: 420, y: 220, w: 320, h: 240,
//       title: "Member Features",
//       lines: [
//         "1. Member & Team details",
//         "2. Skills (add/delete/update)",
//         "3. Skill exam (get certified)",
//         "4. Tasks (status & progress)",
//         "5. Leave (apply, history)",
//         "6. Common Review (monthly/yearly)",
//       ],
//       fill: "#ffffff", stroke: "#adb5bd",
//     },

//     // Member outcomes (right column) — vertically stacked, well spaced
//     {
//       id: "exam_outcome",
//       x: 820, y: 60, w: 320, h: 120,              // moved up-right
//       title: "Exam Outcome",
//       lines: ["≥80% → Certificate", "Stored in user_skills.certificate"],
//       fill: "#f0fff4", stroke: "#79c58a", titleColor: "#198754",
//     },
//     {
//       id: "tasks_monitor",
//       x: 820, y: 210, w: 320, h: 120,             // below exam outcome
//       title: "Tasks Monitoring",
//       lines: ["Progress & status updates", "Not Started → Completed"],
//       fill: "#f0fff4", stroke: "#79c58a", titleColor: "#198754",
//     },
//     {
//       id: "leaves_history",
//       x: 820, y: 360, w: 320, h: 120,             // below tasks monitoring
//       title: "Leaves & History",
//       lines: ["Apply leaves", "View history & holidays"],
//       fill: "#f0fff4", stroke: "#79c58a", titleColor: "#198754",
//     },

//     // Manager lane (middle-bottom column) — placed BELOW member features
//     {
//       id: "manager_dash",
//       x: 420, y: 500, w: 320, h: 130,             // moved down to create space
//       title: "Manager Dashboard",
//       lines: ["After manager login", "Team overview & actions"],
//       fill: "#fff6e8", stroke: "#f0c24b", titleColor: "#d08b00",
//     },
//     {
//       id: "manager_features",
//       x: 420, y: 660, w: 720, h: 180,             // WIDER block, BELOW everything else
//       title: "Manager Features",
//       lines: [
//         "1. Task distribution details · completion graphs",
//         "2. Member details & actions · team details",
//         "3. Leaderboard (best performer)",
//         "4. Common Review (fill ratings) · Leave approvals",
//         "5. Question Manager (add/edit)",
//       ],
//       fill: "#ffffff", stroke: "#adb5bd",
//     },
//   ]);

//   const [edges] = useState([
//     { from: "login",          to: "member_dash",     label: "Member login" },
//     { from: "member_dash",    to: "member_features" },
//     { from: "member_features",to: "exam_outcome" },
//     { from: "member_features",to: "tasks_monitor" },
//     { from: "member_features",to: "leaves_history" },
//     { from: "login",          to: "manager_dash",    label: "Manager login" },
//     { from: "manager_dash",   to: "manager_features" },
//     { from: "login",          to: "director",        label: "Director login" },
//   ]);

//   /** ====== Responsive mode by container width ====== */
//   useEffect(() => {
//     const el = wrapperRef.current;
//     if (!el) return;
//     const setByWidth = () => {
//       const w = el.clientWidth;
//       if (w < 600) setMode("mobile");
//       else if (w < 992) setMode("tablet");
//       else setMode("desktop");
//     };
//     setByWidth();
//     const obs = new ResizeObserver(setByWidth);
//     obs.observe(el);
//     return () => obs.disconnect();
//   }, []);

//   /** ====== Fit-to-width base scale ====== */
//   useEffect(() => {
//     const el = wrapperRef.current;
//     if (!el) return;
//     const avail = el.clientWidth - 16; // padding
//     const s = Math.min(1, avail / canvasW);
//     setBaseScale(s);
//     setPan({ x: 0, y: 0 });
//     setUserZoom(1);
//   }, [canvasW, mode]);

//   /** ====== Drag logic (with collision resolve on drop) ====== */
//   const draggingRef = useRef({ id: null, offset: { x: 0, y: 0 } });
//   const getSvgCoords = (evt) => {
//     const svg = svgRef.current;
//     const rect = svg.getBoundingClientRect();
//     const svgX = evt.clientX - rect.left;
//     const svgY = evt.clientY - rect.top;
//     // inverse transform
//     const x = (svgX - pan.x) / computedScale;
//     const y = (svgY - pan.y) / computedScale;
//     return { x, y };
//   };
//   const onNodePointerDown = (evt, id) => {
//     evt.stopPropagation();
//     const { x, y } = getSvgCoords(evt);
//     const node = nodes.find((n) => n.id === id);
//     if (!node) return;
//     draggingRef.current.id = id;
//     draggingRef.current.offset = { x: x - node.x, y: y - node.y };
//     const svg = svgRef.current;
//     svg && svg.setPointerCapture && svg.setPointerCapture(evt.pointerId);
//   };
//   const onPointerMove = (evt) => {
//     const dragId = draggingRef.current.id;
//     if (!dragId) return;
//     const { x, y } = getSvgCoords(evt);
//     setNodes((prev) =>
//       prev.map((n) =>
//         n.id === dragId
//           ? { ...n, x: x - draggingRef.current.offset.x, y: y - draggingRef.current.offset.y }
//           : n
//       )
//     );
//   };
//   const resolveCollisionsAndSnap = (id) => {
//     setNodes((prev) => {
//       const idx = prev.findIndex((n) => n.id === id);
//       if (idx < 0) return prev;
//       const subj = prev[idx];
//       const snapped = { ...subj, x: snap(subj.x), y: snap(subj.y) };

//       const overlaps = prev.some((n, j) => j !== idx && rectsOverlap(toBounds(snapped), toBounds(n)));
//       if (!overlaps) {
//         const next = [...prev];
//         next[idx] = snapped;
//         return next;
//       }
//       const gx = Math.round(snapped.x / GRID_SIZE);
//       const gy = Math.round(snapped.y / GRID_SIZE);
//       const free = findFreeSlot(prev, idx, gx, gy, canvasW, canvasH);
//       const next = [...prev];
//       next[idx] = { ...snapped, x: free.x, y: free.y };
//       return next;
//     });
//   };
//   const onPointerUp = (evt) => {
//     const dragId = draggingRef.current.id;
//     if (dragId) resolveCollisionsAndSnap(dragId);
//     draggingRef.current.id = null;
//     const svg = svgRef.current;
//     svg && svg.releasePointerCapture && svg.releasePointerCapture(evt.pointerId);
//   };

//   /** ====== Pan / Zoom (background) ====== */
//   const backgroundPanningRef = useRef(false);
//   const lastMouseRef = useRef({ x: 0, y: 0 });
//   const onBackgroundPointerDown = (evt) => {
//     if (draggingRef.current.id) return;
//     backgroundPanningRef.current = true;
//     lastMouseRef.current = { x: evt.clientX, y: evt.clientY };
//     const svg = svgRef.current;
//     svg && svg.setPointerCapture && svg.setPointerCapture(evt.pointerId);
//   };
//   const onBackgroundPointerMove = (evt) => {
//     if (!backgroundPanningRef.current || draggingRef.current.id) return;
//     const dx = evt.clientX - lastMouseRef.current.x;
//     const dy = evt.clientY - lastMouseRef.current.y;
//     lastMouseRef.current = { x: evt.clientX, y: evt.clientY };
//     setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
//   };
//   const onBackgroundPointerUp = (evt) => {
//     backgroundPanningRef.current = false;
//     const svg = svgRef.current;
//     svg && svg.releasePointerCapture && svg.releasePointerCapture(evt.pointerId);
//   };
//   const onWheel = (evt) => {
//     evt.preventDefault();
//     // cursor-centric zoom
//     const svgRect = svgRef.current.getBoundingClientRect();
//     const svgX = evt.clientX - svgRect.left;
//     const svgY = evt.clientY - svgRect.top;
//     const factor = Math.exp(-evt.deltaY * 0.001);
//     const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, userZoom * factor));
//     const nextScale = baseScale * nextZoom;
//     const groupX = (svgX - pan.x) / computedScale;
//     const groupY = (svgY - pan.y) / computedScale;
//     setUserZoom(nextZoom);
//     setPan({ x: svgX - groupX * nextScale, y: svgY - groupY * nextScale });
//   };
//   const onDoubleClick = (evt) => {
//     const svgRect = svgRef.current.getBoundingClientRect();
//     const svgX = evt.clientX - svgRect.left;
//     const svgY = evt.clientY - svgRect.top;
//     const factor = 1.25;
//     const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, userZoom * factor));
//     const nextScale = baseScale * nextZoom;
//     const groupX = (svgX - pan.x) / computedScale;
//     const groupY = (svgY - pan.y) / computedScale;
//     setUserZoom(nextZoom);
//     setPan({ x: svgX - groupX * nextScale, y: svgY - groupY * nextScale });
//   };

//   /** ====== Toolbar ====== */
//   const zoomIn     = () => setUserZoom((z) => Math.min(MAX_ZOOM, z * 1.2));
//   const zoomOut    = () => setUserZoom((z) => Math.max(MIN_ZOOM, z / 1.2));
//   const resetView  = () => { setUserZoom(1); setPan({ x: 0, y: 0 }); };
//   const saveLayout = () => {
//     localStorage.setItem("flowchart-nodes", JSON.stringify(nodes));
//     alert("Layout saved.");
//   };
//   const loadLayout = () => {
//     const raw = localStorage.getItem("flowchart-nodes");
//     if (!raw) return alert("No saved layout found.");
//     try {
//       const parsed = JSON.parse(raw);
//       if (Array.isArray(parsed)) setNodes(parsed);
//       else alert("Invalid saved layout.");
//     } catch {
//       alert("Failed to parse saved layout.");
//     }
//   };

//   /** ====== Grid background (visual aid) ====== */
//   const Grid = () => {
//     const cols = Math.floor(canvasW / GRID_SIZE);
//     const rows = Math.floor(canvasH / GRID_SIZE);
//     const lines = [];
//     for (let c = 1; c < cols; c++) {
//       const x = c * GRID_SIZE;
//       lines.push(<line key={`gc-${c}`} x1={x} y1={0} x2={x} y2={canvasH} stroke="#f1f3f5" strokeWidth={1} />);
//     }
//     for (let r = 1; r < rows; r++) {
//       const y = r * GRID_SIZE;
//       lines.push(<line key={`gr-${r}`} x1={0} y1={y} x2={canvasW} y2={y} stroke="#f1f3f5" strokeWidth={1} />);
//     }
//     return <g>{lines}</g>;
//   };

//   return (
//     <div
//       ref={wrapperRef}
//       style={{
//         width: "100%",
//         position: "relative",
//         overflow: "hidden",
//         padding: "8px",
//         background: "#fff",
//         border: "1px solid #e9ecef",
//         borderRadius: 8,
//       }}
//     >
//       {/* Toolbar */}
//       <div
//         style={{
//           position: "absolute", top: 8, right: 8, zIndex: 2,
//           display: "flex", gap: 8, background: "rgba(255,255,255,0.9)",
//           border: "1px solid #dee2e6", borderRadius: 8, padding: "6px",
//           boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
//         }}
//       >
//         <button className="btn btn-sm btn-outline-secondary" onClick={zoomOut} title="Zoom out">−</button>
//         <button className="btn btn-sm btn-outline-secondary" onClick={zoomIn} title="Zoom in">+</button>
//         <button className="btn btn-sm btn-outline-secondary" onClick={resetView} title="Reset">Reset</button>
//         <button className="btn btn-sm btn-outline-secondary" onClick={saveLayout} title="Save layout">Save</button>
//         <button className="btn btn-sm btn-outline-secondary" onClick={loadLayout} title="Load layout">Load</button>
//         <div className="small text-muted ms-2 align-self-center">
//           {Math.round(computedScale * 100)}%
//         </div>
//       </div>

//       {/* Interactive SVG (background handles pan; nodes handle drag) */}
//       <svg
//         ref={svgRef}
//         viewBox={`0 0 ${canvasW} ${canvasH}`}
//         role="img"
//         aria-label="Flowchart Editor (drag, zoom, pan, collision-free)"
//         width="100%"
//         height={canvasH}
//         style={{ display: "block", touchAction: "none", userSelect: "none" }}
//         onWheel={onWheel}
//         onDoubleClick={onDoubleClick}
//         onPointerDown={onBackgroundPointerDown}
//         onPointerMove={onBackgroundPointerMove}
//         onPointerUp={onBackgroundPointerUp}
//         onPointerLeave={onBackgroundPointerUp}
//       >
//         <defs>
//           <marker id="arrow-head" markerWidth={10} markerHeight={10} refX={6} refY={3} orient="auto" markerUnits="strokeWidth">
//             <path d="M0,0 L0,6 L6,3 z" fill="#6c757d" />
//           </marker>
//         </defs>

//         {/* Pan + Zoom group */}
//         <g transform={`translate(${pan.x}, ${pan.y}) scale(${computedScale})`}>
//           {/* Grid */}
//           <Grid />

//           {/* Titles */}
//           <text x={40} y={30} style={{ fontWeight: "bold", fill: "#0d6efd" }}>Login & Routing</text>
//           <text x={420} y={30} style={{ fontWeight: "bold", fill: "#0d6efd" }}>Member Lane</text>
//           <text x={420} y={480} style={{ fontWeight: "bold", fill: "#d08b00" }}>Manager Lane</text>
//           <text x={40}  y={360} style={{ fontWeight: "bold", fill: "#6f42c1" }}>Director</text>

//           {/* Edges (behind nodes) */}
//           {edges.map((e, i) => <Edge key={`edge-${i}`} from={e.from} to={e.to} nodes={nodes} label={e.label} />)}

//           {/* Nodes (draggable) */}
//           {nodes.map((n) => (
//             <NodeCard key={n.id} node={n} onPointerDown={onNodePointerDown} />
//           ))}
//         </g>
//       </svg>
//     </div>
//   );
// };

// export default FlowchartEditor;
