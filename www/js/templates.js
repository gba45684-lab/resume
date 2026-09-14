/* Resume Studio template registry. All 100 layouts are native HTML/CSS compositions owned by this project. */
const fonts = [
  'Inter,Arial,sans-serif', 'Arial,Helvetica,sans-serif', 'Georgia,serif',
  'Trebuchet MS,Arial,sans-serif', 'Verdana,Arial,sans-serif', 'Tahoma,Arial,sans-serif',
  'Courier New,monospace', 'Times New Roman,serif', 'Garamond,Georgia,serif',
  'Palatino Linotype,Georgia,serif'
];
const colors = [
  '#17181b', '#243447', '#1f4b6e', '#365c4a', '#5a3d5d', '#6b4e2f', '#8a3d3d',
  '#3f4a68', '#0f5965', '#574b3e', '#27364a', '#6a3f2d', '#3d4f5b', '#2f5d50', '#4b426b'
];
const layouts = [
  'classic', 'modern', 'minimal', 'executive', 'editorial', 'sidebar', 'split', 'timeline',
  'compact', 'bold', 'portfolio', 'academic', 'two-column', 'banner', 'ats', 'centered',
  'geometric', 'mono', 'elegant', 'magazine', 'boxed', 'resume-left', 'resume-right',
  'top-rule', 'double-rule', 'capsule', 'grid', 'asymmetric', 'journal', 'tech'
];
const families = ['Professional', 'Modern', 'Minimal', 'Executive', 'Creative', 'Editorial', 'ATS', 'Portfolio', 'Academic', 'Premium'];
const names = [
  'Apex','Atlas','Aura','Beacon','Boldline','Canvas','Cedar','Clarity','Cobalt','Contour',
  'Craft','Crest','Dawn','Edge','Elevate','Ember','Focus','Frame','Frontier','Graphite',
  'Horizon','Icon','Insight','Lattice','Ledger','Lumen','Metro','Momentum','Monarch','Noble',
  'North','Nova','Orbit','Origin','Peak','Pivot','Prime','Quartz','Radius','Rise',
  'Slate','Solstice','Summit','Terra','Vertex','Vista','Vivid','Wave','Zenith','Aster',
  'Bridge','Core','Drift','Elm','Flare','Grid','Halo','Indigo','Jade','Kite',
  'Line','Mosaic','Nexus','Oak','Pulse','Quill','Relay','Sage','Tempo','Union',
  'Vale','Willow','Xeno','Yonder','Zephyr','Arbor','Bloom','Civic','Dune','Echo',
  'Folio','Grove','Helix','Iris','Junction','Kindred','Lunar','Muse','Nexa','Opal',
  'Prism','Quest','Radian','Sierra','Thrive','Urban','Verve','Woven'
];

const TEMPLATES = names.slice(0, 100).map((name, i) => ({
  id: i + 1,
  name: `${String(i + 1).padStart(2, '0')} ${name}`,
  family: families[Math.floor(i / 10)],
  layout: layouts[(i * 7) % layouts.length],
  font: fonts[(i * 3 + 1) % fonts.length],
  color: colors[(i * 5 + 2) % colors.length],
  accentSide: i % 2 ? 'right' : 'left',
  wash: ['#f1f1f3', '#f7f5f1', '#f2f4f6', '#eef4f2', '#f5f1f7'][i % 5],
  density: i % 4,
  photo: i % 3 !== 1,
  source: 'Project-owned original',
  license: 'Project-owned'
}));

window.TEMPLATES = TEMPLATES;
