import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.querySelector('#scene');
const statusEl = document.querySelector('#status');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100);
camera.position.set(0, 0, 2.22);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.setClearColor(0x000000, 0);
renderer.shadowMap.enabled = false;

// Balanced all-around light so the incense remains brown when rotated to its back side.
scene.add(new THREE.HemisphereLight(0xffe9ce, 0x654326, 2.15));
scene.add(new THREE.AmbientLight(0xffdfb5, 1.05));
const lightSpecs = [
  [0xffdfaf, 2.0, [-1.15, 1.2, 2.8]],
  [0xffe7cc, 1.45, [1.45, 0.25, 1.8]],
  [0xffd09a, 1.12, [-0.5, 1.0, -2.1]],
  [0xffe6c2, 1.45, [0.45, -0.5, -2.7]],
];
for (const [color, intensity, position] of lightSpecs) {
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(...position); scene.add(light);
}

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enablePan = false;
controls.enableZoom = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.32;
controls.minDistance = 1.35;
controls.maxDistance = 3.25;
controls.minPolarAngle = 0.12;
controls.maxPolarAngle = Math.PI - 0.12;
controls.target.set(0, 0, 0);
controls.update();

const incenseGroup = new THREE.Group();
incenseGroup.position.x = 0.12;
scene.add(incenseGroup);
const aromaGroup = new THREE.Group();
aromaGroup.position.x = 0.12;
scene.add(aromaGroup);
const loader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
const textureCache = new Map();
let selectionToken = 0;
let activeDecor = [];
let activeKind = 'jasmine';
let lastTime = 0;

const profile = new URLSearchParams(window.location.search).get('profile') || 'hand-rolled';
document.body.classList.add(`profile-${profile}`);
const productConfigs = {
 'hand-rolled': {
  eyebrow:'Selected Aroma', heading:'Select Aroma', note:'Hand-Rolled<br>Incense · Product 003', defaultId:'jasmine',
  data:[
   {id:'plain',label:'Polos',category:'materials',sub:'Pure incense',eyebrow:'Hand-Rolled Incense',title:'Polos',description:'Hand-rolled incense made using selected ingredients, such as aromatic woods, ghee, and other natural materials depending on the formulation.',summary:'Selected natural materials<br>Aromatic woods · Ghee · Botanical'},
   {id:'jasmine',label:'Jasmine',category:'floral',sub:'Floral',eyebrow:'Selected Aroma',title:'Jasmine',description:'A delicate and calming fragrance, bringing a sense of peace and harmony.',summary:'Pure floral notes<br>Soft · Calm · Botanical'},
   {id:'rose',label:'Rose',category:'floral',sub:'Floral',eyebrow:'Selected Aroma',title:'Rose',description:'A rich, velvety floral scent that brings warmth and calm.',summary:'Velvety floral notes<br>Romantic · Warm · Elegant'},
   {id:'musk',label:'Musk',category:'warm',sub:'Warm & sensual',eyebrow:'Selected Aroma',title:'Musk',description:'A soft, enveloping fragrance with a warm and sensual character.',summary:'Soft musk aura<br>Warm · Smooth · Intimate'},
   {id:'bali',label:'Bali Signature',category:'fresh',sub:'Tropical signature',eyebrow:'Selected Aroma',title:'Bali Signature',description:'A distinctive tropical fragrance inspired by the calm, green character of Bali.',summary:'Tropical floral notes<br>Fresh · Serene · Distinctive'},
   {id:'pineapple',label:'Pineapple',category:'fresh',sub:'Fruity & fresh',eyebrow:'Selected Aroma',title:'Pineapple',description:'A bright, juicy fragrance with a fresh tropical character.',summary:'Fresh fruity notes<br>Juicy · Bright · Tropical'},
   {id:'frangipani',label:'Frangipani',category:'floral',sub:'Floral',eyebrow:'Selected Aroma',title:'Frangipani',description:'A gentle tropical floral fragrance with a soft, relaxing character.',summary:'Tropical floral notes<br>Soft · Airy · Relaxing'},
   {id:'champaca',label:'Champaca',category:'floral',sub:'Floral',eyebrow:'Selected Aroma',title:'Champaca',description:'A warm floral fragrance with a rich, graceful character.',summary:'Warm floral notes<br>Rich · Golden · Graceful'},
   {id:'sandalwood',label:'Sandalwood',category:'woody',sub:'Woody',eyebrow:'Selected Aroma',title:'Sandalwood',description:'A grounded woody fragrance with a warm, mellow character.',summary:'Woody notes<br>Grounded · Warm · Calm'},
   {id:'frankincense',label:'Frankincense',category:'resin',sub:'Resin',eyebrow:'Selected Aroma',title:'Frankincense',description:'A distinctive resinous fragrance with a quiet, meditative character.',summary:'Resinous notes<br>Resin · Warm · Meditative'},
   {id:'honey-frankincense',label:'Honey Frankincense',category:'resin',sub:'Sweet & warm',eyebrow:'Selected Aroma',title:'Honey Frankincense',description:'A mellow, sweet-warm fragrance with a gentle resinous finish.',summary:'Sweet resin notes<br>Honeyed · Warm · Smooth'}
  ]
 },
 traditional: {
  eyebrow:'Fragrance Direction', heading:'Explore Fragrance', note:'Traditional Dip<br>Fragrance-infused · Product 001', defaultId:'woody',
  data:[
   {id:'woody',label:'Woody',category:'woody',sub:'Wood-forward',eyebrow:'Fragrance Direction',title:'Woody Fragrance',description:'A wood-forward scent direction for a wood-based and coconut-shell-based incense core that is dipped in fragrance and dried.',summary:'Fragrance-infused<br>Woody · Warm · Grounded'},
   {id:'botanical',label:'Botanical',category:'botanical',sub:'Botanical',eyebrow:'Fragrance Direction',title:'Botanical Fragrance',description:'A botanical-inspired fragrance direction for traditional dipped incense. Final fragrance selection is discussed based on availability.',summary:'Fragrance-infused<br>Botanical · Green · Balanced'},
   {id:'perfume',label:'Perfume-inspired',category:'perfume',sub:'Perfume-inspired',eyebrow:'Fragrance Direction',title:'Perfume-inspired',description:'A perfume-inspired scent direction for traditional dipped incense, with final specifications confirmed through discussion.',summary:'Fragrance-infused<br>Expressive · Refined · Modern'}
  ]
 },
 herbal: {
  eyebrow:'Ingredient Direction', heading:'Select Ingredient', note:'Herbal Incense<br>Ingredient-based · Product 002', defaultId:'sandalwood',
  data:[
   {id:'sandalwood',label:'Sandalwood',category:'woody',sub:'Woody',eyebrow:'Available Ingredient',title:'Sandalwood',description:'An ingredient-led woody direction incorporated into the incense mixture before shaping and drying. Subject to availability.',summary:'Ingredient-based scent<br>Woody · Warm · Grounded'},
   {id:'frankincense',label:'Frankincense',category:'resin',sub:'Resin',eyebrow:'Available Ingredient',title:'Frankincense',description:'A resin-led direction blended into the incense formulation rather than applied by post-production fragrance dipping. Subject to availability.',summary:'Ingredient-based scent<br>Resinous · Warm · Meditative'},
   {id:'agarwood',label:'Agarwood',category:'woody',sub:'Aromatic wood',eyebrow:'Available Ingredient',title:'Agarwood',description:'An aromatic wood ingredient option for the incense formulation, subject to availability and confirmation.',summary:'Ingredient-based scent<br>Deep · Woody · Complex'}
  ]
 },
 custom: {
  eyebrow:'Development Direction', heading:'Explore Materials & Aromas', note:'Custom Incense<br>Development · Product 004', defaultId:'floral-blend',
  data:[
   {id:'floral-blend',label:'Floral Blend',category:'floral',sub:'Aroma direction',eyebrow:'Fragrance Direction',title:'Floral Blend',description:'Explore a floral-led direction using references such as jasmine, rose, frangipani, or champaca. Final blend and availability are confirmed through discussion.',summary:'Aroma exploration<br>Floral · Botanical · Balanced'},
   {id:'jasmine-option',label:'Jasmine',category:'floral',sub:'Floral',eyebrow:'Fragrance Direction',title:'Jasmine',description:'A soft white-floral direction for a custom brief. This visual illustrates the scent family; it does not confirm a fixed formula.',summary:'Floral direction<br>Soft · Fresh · Calm'},
   {id:'rose-option',label:'Rose',category:'floral',sub:'Floral',eyebrow:'Fragrance Direction',title:'Rose',description:'A rich floral direction inspired by blooming rose petals. Final fragrance type depends on available materials and formulation.',summary:'Floral direction<br>Velvety · Warm · Elegant'},
   {id:'frangipani-option',label:'Frangipani',category:'floral',sub:'Tropical floral',eyebrow:'Fragrance Direction',title:'Frangipani',description:'A tropical floral direction for custom development, subject to the agreed brief and production feasibility.',summary:'Floral direction<br>Tropical · Soft · Airy'},
   {id:'champaca-option',label:'Champaca',category:'floral',sub:'Golden floral',eyebrow:'Fragrance Direction',title:'Champaca',description:'A warm, golden floral direction that can be discussed as part of a custom scent brief.',summary:'Floral direction<br>Warm · Rich · Golden'},
   {id:'woody-fragrance',label:'Woody Fragrance',category:'woody',sub:'Fragrance direction',eyebrow:'Fragrance Direction',title:'Woody Fragrance',description:'Explore wood-forward scent profiles, from soft and mellow to deep and resinous. The selected direction will be reviewed for feasibility.',summary:'Aroma exploration<br>Woody · Warm · Grounded'},
   {id:'sandalwood-option',label:'Sandalwood',category:'woody',sub:'Aromatic wood',eyebrow:'Ingredient / Aroma Direction',title:'Sandalwood',description:'Sandalwood can be discussed as an aromatic-wood direction, depending on sourcing, formulation, and availability.',summary:'Woody direction<br>Mellow · Smooth · Warm'},
   {id:'agarwood-option',label:'Agarwood',category:'woody',sub:'Aromatic wood',eyebrow:'Ingredient / Aroma Direction',title:'Agarwood',description:'A deeper aromatic-wood direction for discussion. Ingredient grade, sourcing, and availability must be confirmed before quotation.',summary:'Woody direction<br>Deep · Resinous · Complex'},
   {id:'aromatic-woods',label:'Aromatic Woods',category:'woody',sub:'Material direction',eyebrow:'Material Direction',title:'Aromatic Woods',description:'Wood-based aromatic materials may be discussed based on the desired scent profile and what is available to the production partner.',summary:'Materials brief<br>Aromatic wood · Wood notes'},
   {id:'botanical-blend',label:'Botanical Blend',category:'fresh',sub:'Botanical direction',eyebrow:'Fragrance Direction',title:'Botanical Blend',description:'A green, botanical direction that may combine floral or plant-inspired notes. Specific ingredients depend on the final formulation.',summary:'Aroma exploration<br>Green · Botanical · Natural-inspired'},
   {id:'spice-blend',label:'Spice-inspired',category:'spice',sub:'Spice direction',eyebrow:'Fragrance Direction',title:'Spice-inspired',description:'A warming spice-inspired direction illustrated with botanical, cinnamon, and clove references. Actual ingredients and proportions depend on the agreed formulation.',summary:'Aroma exploration<br>Warm · Spiced · Botanical'},
   {id:'fresh-fruity',label:'Fresh & Fruity',category:'fresh',sub:'Fragrance direction',eyebrow:'Fragrance Direction',title:'Fresh & Fruity',description:'Explore bright, fresh or fruit-inspired scent directions. Particular notes and their feasibility are agreed during the brief review.',summary:'Aroma exploration<br>Fresh · Bright · Fruity'},
   {id:'pineapple-option',label:'Pineapple',category:'fresh',sub:'Fruity direction',eyebrow:'Fragrance Direction',title:'Pineapple',description:'A juicy tropical scent direction for discussion, shown with whole fruit and fresh-cut pineapple as visual inspiration.',summary:'Fruity direction<br>Juicy · Bright · Tropical'},
   {id:'musk-amber',label:'Musk & Amber',category:'resin',sub:'Warm scent direction',eyebrow:'Fragrance Direction',title:'Musk & Amber',description:'A warm, soft and enveloping scent direction. Exact fragrance materials, composition, and availability require confirmation.',summary:'Aroma exploration<br>Warm · Soft · Rounded'},
   {id:'perfume-inspired',label:'Perfume-inspired',category:'fresh',sub:'Fragrance direction',eyebrow:'Fragrance Direction',title:'Perfume-inspired',description:'A contemporary fragrance direction inspired by fine fragrance profiles. Options are discussed and assessed for formulation feasibility.',summary:'Aroma exploration<br>Expressive · Refined · Modern'},
   {id:'frankincense-option',label:'Frankincense',category:'resin',sub:'Natural resin direction',eyebrow:'Ingredient / Aroma Direction',title:'Frankincense',description:'A resinous direction that can be discussed for suitable formulations, subject to material availability and production feasibility.',summary:'Resin direction<br>Resinous · Warm · Meditative'},
   {id:'honey-resin',label:'Honey Frankincense',category:'resin',sub:'Sweet resin direction',eyebrow:'Fragrance Direction',title:'Honey Frankincense',description:'A sweet-warm resin-inspired direction for exploration. The image is illustrative and does not confirm the precise recipe.',summary:'Aroma exploration<br>Sweet · Warm · Resinous'},
   {id:'natural-resins',label:'Natural Resins',category:'materials',sub:'Ingredient direction',eyebrow:'Material Direction',title:'Natural Resins',description:'Resin ingredients can be discussed for formulations where suitable, based on sourcing, availability, and the product brief.',summary:'Materials brief<br>Resins · Aroma materials'},
   {id:'botanical-materials',label:'Botanical Materials',category:'materials',sub:'Ingredient direction',eyebrow:'Material Direction',title:'Botanical Materials',description:'Selected botanical ingredients may be considered depending on formulation goals and available materials. Final composition must be confirmed.',summary:'Materials brief<br>Botanical · Plant-derived references'},
   {id:'ghee-formulation',label:'Ghee / Natural Base',category:'materials',sub:'Formulation option',eyebrow:'Material Direction',title:'Ghee / Natural Base',description:'Ghee and other natural materials can be discussed for relevant hand-rolled formulations. Inclusion depends on the selected product type and confirmed recipe.',summary:'Formulation brief<br>Ghee · Natural materials'},
   {id:'coconut-core',label:'Coconut-shell-based Core',category:'materials',sub:'Base material',eyebrow:'Material Direction',title:'Coconut-shell-based Core',description:'A coconut-shell-based core is one material direction to discuss for suitable incense formats. Exact composition varies by manufacturer and formulation.',summary:'Materials brief<br>Coconut-shell-based material'},
   {id:'wood-binder',label:'Wood-based Binder',category:'materials',sub:'Base material',eyebrow:'Material Direction',title:'Wood-based Binder',description:'A wood-based binder or carrier can be discussed according to the selected format and supplier formulation. Final composition is confirmed separately.',summary:'Materials brief<br>Wood-based binder'},
   {id:'organic-essential-oil',label:'Organic Essential Oils',category:'materials',sub:'Premium option',eyebrow:'Material Direction',title:'Organic Essential Oils',description:'An organic essential-oil-based formulation may be requested as a premium option, subject to sourcing, compatibility, sampling, and feasibility.',summary:'Premium formulation<br>Essential-oil based · Upon request'},
   {id:'dimensions',label:'Length, Diameter & Shape',category:'design',sub:'Product geometry',eyebrow:'Development Option',title:'Length, Diameter & Shape',description:'Specify requested length, diameter, shape, and form factor. Feasible dimensions and the final specification are agreed after review and sample evaluation.',summary:'Design brief<br>Length · Diameter · Shape'},
   {id:'performance',label:'Burning & Smoke Targets',category:'design',sub:'Performance target',eyebrow:'Development Option',title:'Burning & Smoke Targets',description:'Define target burning time, smoke level, intended use, and other product-performance priorities. Targets need assessment and sample testing.',summary:'Performance brief<br>Burning time · Smoke · Intended use'},
   {id:'packaging',label:'Packaging',category:'design',sub:'Presentation',eyebrow:'Development Option',title:'Packaging',description:'Discuss packaging format, materials, finishing, and presentation requirements. Cost and production feasibility depend on the requested design.',summary:'Presentation brief<br>Packaging · Finishing'},
   {id:'private-label',label:'Private Label',category:'design',sub:'Branding',eyebrow:'Development Option',title:'Private Label',description:'Private-label branding can be discussed, including labeling and product presentation requirements, subject to order conditions and feasibility.',summary:'Brand brief<br>Private label · Product presentation'},
   {id:'rd-sampling',label:'R&D & Sampling',category:'design',sub:'Development process',eyebrow:'Development Option',title:'R&D & Sampling',description:'New formulations or specifications may require additional research, development, and sampling. Associated cost, MOQ, and lead time are discussed after reviewing the brief.',summary:'Project review<br>R&D · Samples · Feasibility'}
  ]
 }
};
const config = productConfigs[profile] || productConfigs['hand-rolled'];
const data = config.data;
const heroTitle = document.querySelector('#hero-title');
const heroCategory = document.querySelector('#hero-category');
const heroDescription = document.querySelector('#hero-description');
const heroSummary = document.querySelector('#hero-summary');
const eyebrow = document.querySelector('#eyebrow');
const stageStamp = document.querySelector('#stage-stamp');
const choices = document.querySelector('#choices');
const selectorTitle = document.querySelector('.selector-title');
const selectorNote = document.querySelector('.selector-note');
const choiceButtons = new Map();
selectorTitle.textContent=config.heading;
selectorNote.innerHTML=config.note;
document.title=`NARA — ${profile==='hand-rolled'?'Hand-Rolled Incense':profile==='traditional'?'Traditional Dip Incense':profile==='herbal'?'Herbal Incense':'Custom Incense Development'} Studio`;

const thumbMap = {
 plain: null, jasmine:'jasmine.webp', rose:'rose.webp', musk:'musk-resin-wood.webp', bali:'bali-signature.webp',
 pineapple:'pineapple-slices.webp', frangipani:'frangipani.webp', champaca:'champaca.webp',
 sandalwood:'sandalwood.webp', frankincense:'frankincense.webp', 'honey-frankincense':'honey-frankincense.webp',
 woody:'sandalwood.webp', botanical:'jasmine.webp', perfume:'musk-resin-wood.webp', agarwood:'musk-resin-wood.webp',
 fragrance:'rose.webp', materials:'sandalwood.webp', dimensions:'sandalwood.webp', performance:'frankincense.webp',
 'floral-blend':'rose.webp','jasmine-option':'jasmine.webp','rose-option':'rose.webp','frangipani-option':'frangipani.webp','champaca-option':'champaca.webp',
 'woody-fragrance':'sandalwood.webp','sandalwood-option':'sandalwood.webp','agarwood-option':'musk-resin-wood.webp','aromatic-woods':'sandalwood.webp',
 'botanical-blend':'bali-signature.webp','spice-blend':'bali-signature.webp','fresh-fruity':'pineapple-slices.webp','pineapple-option':'pineapple-slices.webp','musk-amber':'musk-resin-wood.webp',
 'perfume-inspired':'musk-resin-wood.webp','frankincense-option':'frankincense.webp','honey-resin':'honey-frankincense.webp','natural-resins':'frankincense.webp',
 'botanical-materials':'jasmine.webp','ghee-formulation':'honey-frankincense.webp','coconut-core':'sandalwood.webp','wood-binder':'sandalwood.webp',
 'organic-essential-oil':'bali-signature.webp','packaging':'sandalwood.webp','private-label':'rose.webp','rd-sampling':'musk-resin-wood.webp'
};
for (const item of data) {
 const button = document.createElement('button');
 button.type = 'button'; button.className = 'choice'; button.dataset.id = item.id;
 button.setAttribute('aria-pressed', item.id === config.defaultId ? 'true' : 'false');
 const imageBox = document.createElement('span'); imageBox.className = 'choice-image';
 if (item.id === 'plain') imageBox.classList.add('thumb-plain');
 else {
  const img = document.createElement('img'); img.src = `./assets/aromas/${thumbMap[item.id] || 'sandalwood.webp'}`; img.alt = ''; img.loading = 'lazy'; imageBox.append(img);
 }
 const copy = document.createElement('span'); copy.className = 'choice-copy';
 const name = document.createElement('span'); name.className = 'choice-name'; name.textContent = item.label;
 const sub = document.createElement('span'); sub.className = 'choice-sub'; sub.textContent = item.sub;
 copy.append(name, sub); button.append(imageBox, copy);
 button.addEventListener('click', () => selectAroma(item.id));
 choices.append(button); choiceButtons.set(item.id, button);
}

function getTexture(asset) {
 if (textureCache.has(asset)) return textureCache.get(asset);
 const promise = new Promise((resolve, reject) => {
  textureLoader.load(`./assets/aromas/${asset}.webp`, texture => {
   texture.colorSpace = THREE.SRGBColorSpace;
   texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
   resolve(texture);
  }, undefined, reject);
 });
 textureCache.set(asset, promise); return promise;
}
function disposeDecor() {
 for (const item of activeDecor) {
  aromaGroup.remove(item);
  if (item.material) item.material.dispose();
  if (!item.isSprite && item.geometry) item.geometry.dispose();
 }
 activeDecor = [];
}
function spriteSpec(asset, x, y, z, size, angle=0) { return {asset, x, y, z, size, angle}; }
const aromaLayouts = {
 // The plain mode intentionally shows raw ingredient visuals only.
 plain:[
  spriteSpec('sandalwood',-.35,.30,-.10,.27,-.12),
  spriteSpec('frankincense',.34,.23,.10,.25,.12),
  spriteSpec('musk-resin-wood',-.38,-.13,.06,.29,.15),
  spriteSpec('honey-frankincense',.33,-.31,-.08,.25,-.12),
 ],
 jasmine:[
  spriteSpec('jasmine',-.36,.25,.06,.30,-.16),spriteSpec('jasmine',.35,.12,-.10,.26,.12),spriteSpec('jasmine',-.31,-.28,.13,.25,.08)
 ],
 rose:[
  spriteSpec('rose',.36,.13,.06,.43,-.06),spriteSpec('rose-petal',-.36,.30,.02,.20,-.22),spriteSpec('rose-petal',.37,-.25,-.08,.16,.26),spriteSpec('rose-petal',-.30,-.30,.13,.17,.16)
 ],
 bali:[spriteSpec('frangipani',.36,.17,.03,.35,-.08),spriteSpec('frangipani',-.34,-.22,-.08,.27,.13)],
 pineapple:[spriteSpec('pineapple-slices',.35,.05,.02,.49,-.05)],
 frangipani:[spriteSpec('frangipani',-.36,.24,.05,.32,-.13),spriteSpec('frangipani',.35,.12,-.08,.28,.11),spriteSpec('frangipani',-.31,-.28,.10,.25,.10)],
 champaca:[spriteSpec('champaca',-.35,.26,.04,.32,-.12),spriteSpec('champaca',.36,.06,-.08,.29,.14),spriteSpec('champaca',-.30,-.29,.11,.25,.08)],
 sandalwood:[spriteSpec('sandalwood',-.36,.22,.04,.31,-.13),spriteSpec('sandalwood',.34,-.17,-.08,.31,.13)],
 frankincense:[spriteSpec('frankincense',-.36,.22,.04,.31,-.11),spriteSpec('frankincense',.35,-.18,-.08,.28,.14)],
 'honey-frankincense':[spriteSpec('honey-frankincense',-.35,.20,.02,.32,-.1),spriteSpec('honey-frankincense',.34,-.20,-.08,.31,.12)],
 // Traditional dip fragrance directions — visuals suggest a scent family, not a fixed formula.
 woody:[spriteSpec('sandalwood',-.36,.22,.04,.34,-.13),spriteSpec('sandalwood',.35,-.18,-.08,.32,.13)],
 botanical:[spriteSpec('jasmine',-.36,.22,.05,.32,-.13),spriteSpec('frangipani',.35,-.14,-.08,.30,.12),spriteSpec('frangipani',-.30,-.29,.11,.24,.08)],
 perfume:[spriteSpec('musk-resin-wood',-.35,.20,.04,.34,-.1),spriteSpec('honey-frankincense',.35,-.18,-.08,.30,.12)],
 // Herbal ingredient directions.
 agarwood:[spriteSpec('musk-resin-wood',-.34,.20,.04,.35,-.12),spriteSpec('musk-resin-wood',.34,-.18,-.08,.32,.12)],
 // Custom development views reflect the selected brief component.
 fragrance:[spriteSpec('rose',.36,.13,.06,.37,-.06),spriteSpec('rose-petal',-.36,.29,.02,.19,-.22),spriteSpec('jasmine',-.31,-.28,.13,.25,.08)],
 materials:[spriteSpec('sandalwood',-.36,.22,.04,.31,-.13),spriteSpec('frankincense',.34,-.17,-.08,.31,.13)],
 dimensions:[spriteSpec('sandalwood',-.36,.22,.04,.26,-.13),spriteSpec('sandalwood',.34,-.17,-.08,.26,.13)],
 performance:[spriteSpec('frankincense',-.36,.22,.04,.31,-.11),spriteSpec('honey-frankincense',.35,-.18,-.08,.28,.14)],
 // Custom development options: visuals are mood-board references only; actual material inclusion depends on formulation.
 'floral-blend':[spriteSpec('rose',.32,.20,.05,.40,-.06),spriteSpec('jasmine',-.34,.12,.02,.31,.12),spriteSpec('frangipani',-.28,-.28,.11,.27,.08)],
 'jasmine-option':[spriteSpec('jasmine',-.33,.22,.05,.34,-.12),spriteSpec('jasmine',.34,.10,-.06,.30,.13),spriteSpec('jasmine',-.28,-.25,.1,.27,.08)],
 'rose-option':[spriteSpec('rose',.34,.14,.05,.43,-.06),spriteSpec('rose-petal',-.35,.3,.02,.20,-.22),spriteSpec('rose-petal',.30,-.28,.09,.18,.16)],
 'frangipani-option':[spriteSpec('frangipani',-.33,.22,.05,.34,-.13),spriteSpec('frangipani',.34,.08,-.08,.31,.12),spriteSpec('frangipani',-.28,-.27,.11,.26,.08)],
 'champaca-option':[spriteSpec('champaca',-.34,.23,.04,.34,-.12),spriteSpec('champaca',.34,.08,-.08,.30,.14),spriteSpec('champaca',-.27,-.27,.1,.25,.08)],
 'woody-fragrance':[spriteSpec('sandalwood',-.35,.22,.04,.32,-.12),spriteSpec('musk-resin-wood',.34,.06,-.08,.30,.14),spriteSpec('sandalwood',-.30,-.26,.1,.26,.08)],
 'sandalwood-option':[spriteSpec('sandalwood',-.35,.20,.04,.34,-.13),spriteSpec('sandalwood',.34,-.17,-.08,.32,.13)],
 'agarwood-option':[spriteSpec('musk-resin-wood',-.34,.20,.04,.34,-.12),spriteSpec('musk-resin-wood',.34,-.17,-.08,.31,.12)],
 'aromatic-woods':[spriteSpec('sandalwood',-.35,.22,.04,.32,-.13),spriteSpec('musk-resin-wood',.34,-.17,-.08,.30,.13)],
 'botanical-blend':[spriteSpec('bali-signature',-.33,.22,.05,.35,-.13),spriteSpec('jasmine',.34,.08,-.08,.29,.12)],
 'spice-blend':[spriteSpec('bali-signature',-.34,.2,.04,.34,-.12),spriteSpec('sandalwood',.34,-.16,-.08,.28,.13)],
 'fresh-fruity':[spriteSpec('pineapple-slices',.34,.08,.02,.40,-.04),spriteSpec('bali-signature',-.33,-.22,-.05,.30,.12)],
 'pineapple-option':[spriteSpec('pineapple-slices',.34,.03,.02,.49,-.04)],
 'musk-amber':[spriteSpec('musk-resin-wood',-.34,.20,.04,.34,-.12),spriteSpec('honey-frankincense',.34,-.17,-.08,.29,.13)],
 'perfume-inspired':[spriteSpec('musk-resin-wood',-.34,.20,.04,.34,-.12),spriteSpec('honey-frankincense',.34,-.17,-.08,.29,.13)],
 'frankincense-option':[spriteSpec('frankincense',-.34,.21,.04,.33,-.12),spriteSpec('frankincense',.34,-.16,-.08,.30,.13)],
 'honey-resin':[spriteSpec('honey-frankincense',-.34,.19,.04,.33,-.12),spriteSpec('frankincense',.34,-.17,-.08,.29,.13)],
 'natural-resins':[spriteSpec('frankincense',-.35,.20,.04,.32,-.12),spriteSpec('honey-frankincense',.34,-.17,-.08,.29,.13)],
 'botanical-materials':[spriteSpec('jasmine',-.34,.2,.04,.32,-.12),spriteSpec('frangipani',.34,-.14,-.08,.29,.13)],
 'ghee-formulation':[spriteSpec('honey-frankincense',-.34,.18,.04,.31,-.12),spriteSpec('musk-resin-wood',.34,-.17,-.08,.29,.13)],
 'coconut-core':[spriteSpec('sandalwood',-.34,.20,.04,.32,-.12),spriteSpec('musk-resin-wood',.34,-.17,-.08,.30,.13)],
 'wood-binder':[spriteSpec('sandalwood',-.34,.20,.04,.32,-.12),spriteSpec('sandalwood',.34,-.17,-.08,.30,.13)],
 'organic-essential-oil':[spriteSpec('bali-signature',-.34,.20,.04,.32,-.12),spriteSpec('honey-frankincense',.34,-.17,-.08,.30,.13)],
 packaging:[spriteSpec('sandalwood',-.35,.22,.04,.31,-.13),spriteSpec('musk-resin-wood',.34,-.17,-.08,.29,.13)],
 'private-label':[spriteSpec('rose',-.34,.19,.04,.31,-.12),spriteSpec('bali-signature',.34,-.16,-.08,.29,.13)],
 'rd-sampling':[spriteSpec('sandalwood',-.35,.22,.04,.30,-.13),spriteSpec('frankincense',.34,-.17,-.08,.29,.13)]
};
function addMuskAura() {
 const positions=[[-.35,.28,.03,.072],[.38,.20,-.06,.055],[-.32,-.18,.11,.06],[.35,-.31,-.04,.082]];
 positions.forEach(([x,y,z,r],i)=>{
  const geo=new THREE.SphereGeometry(r,12,10);
  const mat=new THREE.MeshPhysicalMaterial({color:i%2?'#c8b18b':'#f0dfc1',roughness:.34,metalness:0,clearcoat:.2,transparent:true,opacity:.68,emissive:'#5e4326',emissiveIntensity:.07,depthWrite:false});
  const sphere=new THREE.Mesh(geo,mat); sphere.position.set(x,y,z);
  sphere.userData={baseX:x,baseY:y,baseZ:z,phase:i*1.4,speed:.45+i*.07,amp:.025};
  aromaGroup.add(sphere); activeDecor.push(sphere);
 });
}
async function addAroma(id, token) {
 disposeDecor();
 if (id === 'musk' || id === 'musk-amber') { addMuskAura(); return; }
 const layout=aromaLayouts[id] || [];
 try {
  const loaded=await Promise.all(layout.map(s=>getTexture(s.asset)));
  if (token!==selectionToken || activeKind!==id) return;
  layout.forEach((s,i)=>{
   const texture=loaded[i];
   const aspect=texture.image.width/texture.image.height;
   const mat=new THREE.SpriteMaterial({map:texture,color:0xffffff,transparent:true,opacity:1,depthTest:true,depthWrite:false,alphaTest:.045,toneMapped:false});
   const sprite=new THREE.Sprite(mat);
   if(aspect>=1) sprite.scale.set(s.size,s.size/aspect,1); else sprite.scale.set(s.size*aspect,s.size,1);
   sprite.position.set(s.x,s.y,s.z); sprite.material.rotation=s.angle;
   sprite.userData={baseX:s.x,baseY:s.y,baseZ:s.z,baseRot:s.angle,baseScaleX:sprite.scale.x,baseScaleY:sprite.scale.y,phase:i*1.7+.4,ampX:.012+(i%2)*.006,ampY:.018+(i%3)*.006,ampZ:.015+(i%2)*.012,speed:.42+(i%3)*.10};
   aromaGroup.add(sprite); activeDecor.push(sprite);
  });
  statusEl.style.display='none';
 } catch(err) {
  statusEl.textContent='Ada aset aroma yang belum termuat. Pastikan folder assets/aromas ikut diunggah.';
  statusEl.style.display='block'; console.error('Aroma texture load error:',err);
 }
}

// Slim, low-poly golden spiral adds motion depth without a heavy post-processing effect.
function addLightTrail(radius, phase, opacity) {
 const points=[]; const steps=100;
 for(let i=0;i<=steps;i++){
  const t=i/steps; const angle=t*Math.PI*3.1+phase;
  points.push(new THREE.Vector3(Math.cos(angle)*radius+0.12, (t-.5)*1.20, Math.sin(angle)*radius-.10));
 }
 const curve=new THREE.CatmullRomCurve3(points);
 const geo=new THREE.TubeGeometry(curve,steps,.0024,3,false);
 const mat=new THREE.MeshBasicMaterial({color:'#c49a55',transparent:true,opacity,depthWrite:false});
 const line=new THREE.Mesh(geo,mat); scene.add(line); return line;
}
const trails=[addLightTrail(.24,0,.16),addLightTrail(.31,1.6,.08)];
const sparkleCount=26; const sparklePositions=new Float32Array(sparkleCount*3); const sparkleMotion=[];
for(let i=0;i<sparkleCount;i++){
 sparklePositions[i*3]=(Math.random()-.5)*.95+.12;
 sparklePositions[i*3+1]=(Math.random()-.5)*1.35;
 sparklePositions[i*3+2]=(Math.random()-.5)*.28;
 sparkleMotion.push({phase:Math.random()*6.28,speed:.22+Math.random()*.45,baseY:sparklePositions[i*3+1],baseX:sparklePositions[i*3]});
}
const particleGeo=new THREE.BufferGeometry(); particleGeo.setAttribute('position',new THREE.BufferAttribute(sparklePositions,3));
const particleMat=new THREE.PointsMaterial({color:'#d8ad64',size:.0085,transparent:true,opacity:.48,sizeAttenuation:true,depthWrite:false});
const sparkles=new THREE.Points(particleGeo,particleMat);scene.add(sparkles);

function makeRodMaterial(color, roughness=.76, clearcoat=.04) {
 return new THREE.MeshPhysicalMaterial({color, roughness, metalness:0, clearcoat, clearcoatRoughness:.82, side:THREE.DoubleSide});
}
function addCylinderStick({x=0,yBase=-.82,z=0,height=1.64,rTop=.018,rBottom=.018,color='#875335',roughness=.78,clearcoat=.04,rotationZ=0,segments=14,material=null}) {
 const geo=new THREE.CylinderGeometry(rTop,rBottom,height,segments,4,false);
 geo.computeVertexNormals();
 const mesh=new THREE.Mesh(geo,material||makeRodMaterial(color,roughness,clearcoat));
 mesh.position.set(x,yBase+height/2,z); mesh.rotation.z=rotationZ; mesh.castShadow=false; mesh.receiveShadow=false;
 incenseGroup.add(mesh); return mesh;
}
function addHerbalTextureLines(x, height, radius) {
 // Fine low-contrast grain lines suggest a natural ingredient-blended body, without adding heavy textures.
 for(let i=0;i<5;i++){
  const a=(i/5)*Math.PI*2;
  const points=[];
  for(let j=0;j<=8;j++){
   const t=j/8; const y=-.82+t*height;
   const r=radius*(.98+.02*Math.sin(t*15+i));
   points.push(new THREE.Vector3(x+Math.cos(a)*r,y,Math.sin(a)*r));
  }
  const curve=new THREE.CatmullRomCurve3(points);
  const geo=new THREE.TubeGeometry(curve,16,.0008,3,false);
  const mat=new THREE.MeshBasicMaterial({color:i%2?'#b17a50':'#6b432e',transparent:true,opacity:.48,depthWrite:false});
  const line=new THREE.Mesh(geo,mat); incenseGroup.add(line);
 }
}
function buildTraditionalDip() {
 // Fragrance-dipped coating over a fine central core; several sticks make this format visually distinct.
 const positions=[{x:-.092,h:1.28,tilt:-.055,color:'#8d492e'},{x:0,h:1.44,tilt:0,color:'#995334'},{x:.092,h:1.32,tilt:.055,color:'#844329'}];
 positions.forEach((p,i)=>{
  const base=-.82; const coreHeight=p.h+.23;
  addCylinderStick({x:p.x,yBase:base,z:-.015+i*.006,height:coreHeight,rTop:.008,rBottom:.008,color:'#c08b54',roughness:.72,clearcoat:.015,rotationZ:p.tilt,segments:10});
  addCylinderStick({x:p.x,yBase:base+.22,z:.003+i*.006,height:p.h,rTop:.019,rBottom:.014,color:p.color,roughness:.43,clearcoat:.18,rotationZ:p.tilt,segments:16});
 });
}
function buildHerbalStick() {
 // One ingredient-blended body: matte, gently irregular and without the dipped coating / exposed core look.
 const mat=makeRodMaterial('#9b653f',.9,.012);
 addCylinderStick({x:0,yBase:-.82,z:0,height:1.64,rTop:.018,rBottom:.022,color:'#9b653f',roughness:.9,clearcoat:.012,segments:18,material:mat});
 addHerbalTextureLines(0,1.64,.020);
}
function buildCustomSamples() {
 // Three draft samples communicate that length, diameter and shape can be developed to a buyer brief.
 addCylinderStick({x:-.085,yBase:-.82,z:-.025,height:1.42,rTop:.016,rBottom:.022,color:'#815033',roughness:.78,clearcoat:.035,rotationZ:-.085,segments:14});
 addCylinderStick({x:0,yBase:-.82,z:.02,height:1.64,rTop:.018,rBottom:.018,color:'#a36a42',roughness:.68,clearcoat:.06,rotationZ:0,segments:14});
 addCylinderStick({x:.086,yBase:-.82,z:-.015,height:1.28,rTop:.023,rBottom:.023,color:'#6f4931',roughness:.74,clearcoat:.045,rotationZ:.09,segments:14});
}
// Keep the same recognizable incense silhouette across all product pages.
// The product profile changes only the warm-brown finish and surface roughness.
const stickFinish = {
 'hand-rolled': {body:'#8c492d', roughness:.64, clearcoat:.065, wood:'#b77942'},
 'traditional': {body:'#965b3b', roughness:.53, clearcoat:.095, wood:'#bd8750'},
 'herbal': {body:'#89583a', roughness:.82, clearcoat:.018, wood:'#b17a49'},
 'custom': {body:'#8f5031', roughness:.68, clearcoat:.05, wood:'#b77c47'}
}[profile] || {body:'#8c492d',roughness:.64,clearcoat:.065,wood:'#b77942'};
loader.load('./nara-incense-stick.glb', gltf=>{
 const model=gltf.scene;
 model.scale.setScalar(3.58); model.position.y=-.521;
 model.traverse(obj=>{
  if(!obj.isMesh) return;
  obj.castShadow=false; obj.receiveShadow=false;
  if(obj.geometry?.attributes?.color) obj.geometry.deleteAttribute('color');
  obj.geometry.computeVertexNormals();
  const name=(obj.material?.name||'').toLowerCase();
  const isWood=name.includes('wood')||name.includes('exposed');
  const isTransition=name.includes('transition');
  obj.material=new THREE.MeshPhysicalMaterial({
   color:isWood?stickFinish.wood:(isTransition?stickFinish.body:stickFinish.body),
   roughness:isWood?.76:stickFinish.roughness,
   metalness:0, clearcoat:isWood?.025:stickFinish.clearcoat,
   clearcoatRoughness:isWood?.88:.78,
   emissive:isWood?'#211209':'#1c0c06', emissiveIntensity:.018,
   side:THREE.DoubleSide, vertexColors:false
  });
 });
 incenseGroup.add(model); statusEl.style.display='none';
},undefined,err=>{
 statusEl.textContent='Model 3D tidak dapat dimuat. Pastikan nara-incense-stick.glb berada satu folder dengan demo.html.';
 statusEl.style.display='block'; console.error(err);
});

function selectAroma(id){
 const item=data.find(x=>x.id===id)||data[0];
 activeKind=id;const token=++selectionToken;
 for(const [key,button] of choiceButtons) button.setAttribute('aria-pressed',key===id?'true':'false');
 eyebrow.textContent=item.eyebrow;
 heroTitle.textContent=item.title;
 heroCategory.textContent=(item.category==='materials'&&profile==='hand-rolled')?'PURE INCENSE':item.sub.toUpperCase();
 heroDescription.textContent=item.description;
 heroSummary.innerHTML=item.summary;
 stageStamp.textContent=profile==='traditional'?`${item.label} · Fragrance Direction`:profile==='herbal'?`${item.label} · Ingredient Direction`:profile==='custom'?`${item.label} · Development Brief`:id==='plain'?'Polos · Ingredients':`${item.label} · ${item.sub}`;
 addAroma(id,token);
}
function resize(){
 const rect=canvas.getBoundingClientRect();
 const w=Math.max(1,Math.floor(rect.width)),h=Math.max(1,Math.floor(rect.height));
 renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas);resize();
const clock=new THREE.Clock();
function animate(){
 requestAnimationFrame(animate);
 const t=clock.getElapsedTime();
 for(const obj of activeDecor){
  const d=obj.userData;
  if(obj.isSprite){
   const w=t*d.speed+d.phase;
   obj.position.x=d.baseX+Math.sin(w*.67)*d.ampX;
   obj.position.y=d.baseY+Math.sin(w)*d.ampY;
   obj.position.z=d.baseZ+Math.cos(w*.62)*d.ampZ;
   obj.material.rotation=d.baseRot+Math.sin(w*.78)*.055;
   const breathe=1+Math.sin(w*.9)*.018;obj.scale.set(d.baseScaleX*breathe,d.baseScaleY*breathe,1);
  }else{
   const w=t*d.speed+d.phase;obj.position.x=d.baseX+Math.sin(w)*d.amp;obj.position.y=d.baseY+Math.cos(w*.8)*d.amp*1.4;obj.position.z=d.baseZ+Math.sin(w*.6)*d.amp;
  }
 }
 const pos=particleGeo.attributes.position.array;
 for(let i=0;i<sparkleCount;i++){
  const d=sparkleMotion[i];pos[i*3]=d.baseX+Math.sin(t*d.speed+d.phase)*.025;pos[i*3+1]=d.baseY+Math.sin(t*.32+d.phase)*.018;pos[i*3+2]=((pos[i*3+2]+.001)%0.32)-.16;
 }
 particleGeo.attributes.position.needsUpdate=true;
 controls.update();renderer.render(scene,camera);
}
animate();
selectAroma(config.defaultId);
