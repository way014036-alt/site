"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Package, ShieldCheck, CreditCard, Monitor, Key, Users, Star, CheckCircle, ShoppingCart, Plus, X, RotateCcw, ChevronDown, BadgeCheck } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   NEPLIM STORE — Loja de Jogos Steam | Tema Roxo
═══════════════════════════════════════════════════════════ */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

// ⚠️ TROQUE pela sua PUBLIC KEY do Mercado Pago (painel > Suas integrações > Credenciais)
// É diferente do MP_ACCESS_TOKEN do backend! Essa é pública e fica exposta no navegador, tudo bem.
const MP_PUBLIC_KEY = "SUA_PUBLIC_KEY_AQUI";

const C = {
  bg: '#000000',
  surface: '#0a0a0a',
  card: '#0f0f0f',
  cardHover: '#161616',
  primary: '#7B2FBE',
  primaryHover: '#9D4EDD',
  secondary: '#C77DFF',
  accent: '#E0AAFF',
  text: '#E0AAFF',
  textMuted: '#9B7EC8',
  textLight: '#FFFFFF',
  border: 'rgba(123,47,190,0.4)',
  glow: 'rgba(123,47,190,0.65)',
  green: '#4CAF50',
};

interface FeaturedGame {
  id: number;
  appId?: number;
  title: string;
  youtubeId: string;
  price: string;
  description: string;
  cover: string;
  badge: string;
}

interface Requirements {
  os: string;
  cpu: string;
  ram: string;
  gpu: string;
  storage: string;
  directX: string;
}

interface GameVariant {
  label: string;
  price: string;
  stock: number;
}

interface Game {
  id: number;
  appId?: number;
  title: string;
  price: string;
  originalPrice?: string;
  discount?: number;
  category: string;
  reviewScore?: string;
  description?: string;
  developer?: string;
  publisher?: string;
  releaseDate?: string;
  players?: string;
  genres?: string[];
  minReq?: Requirements;
  recReq?: Requirements;
  variants?: GameVariant[];
  active?: boolean;
}

interface AccountProduct {
  id: number;
  title: string;
  subtitle: string;
  price: string;
  color: string;
  gradient: string;
}

// ── Data: Featured Games ───────────────────────────────────
const FEATURED: FeaturedGame[] = [
  { id:1, appId:3764200, title:'Resident Evil Requiem', youtubeId:'RJ7eRQgJBbo', price:'R$ 24,99', badge:'Terror Absoluto', description:'O próximo e aterrorizante capítulo da icônica franquia de survival horror.', cover:'https://i.ytimg.com/vi/RJ7eRQgJBbo/maxresdefault.jpg' },
  { id:2, appId:2050650, title:'Resident Evil 4 Remake', youtubeId:'9iy6gHDKvzA', price:'R$ 24,99', badge:'Mais Vendido', description:'Sobrevivência é apenas o começo. Seis anos após o desastre biológico em Raccoon City.', cover:'https://i.ytimg.com/vi/9iy6gHDKvzA/maxresdefault.jpg' },
  { id:3, appId:1174180, title:'Cyberpunk 2077', youtubeId:'8X2kIfS6fb8', price:'R$ 24,99', badge:'Premiado', description:'cyberpunk é um subgênero da ficção científica e um movimento cultural que se passa em futuros distópicos onde a tecnologia avançada contrasta com a degradação social', cover:'https://i.ytimg.com/vi/8X2kIfS6fb8/maxresdefault.jpg' },
  { id:4, appId:1203220, title:'Pragmata', youtubeId:'oncaa_fMsyw', price:'R$ 24,99', badge:'Em Destaque', description:'Uma jornada épica de ficção científica desenvolvida pela Capcom. Explore uma Lua misteriosa.', cover:'https://i.ytimg.com/vi/oncaa_fMsyw/maxresdefault.jpg' },
  { id:5, appId:410830, title:'Lego Batman', youtubeId:'j5ha2VwHJCw', price:'R$ 24,99', badge:'Novo Lançamento', description:'Construa, destrua e lute na mais nova aventura do Cavaleiro das Trevas em formato LEGO.', cover:'https://i.ytimg.com/vi/j5ha2VwHJCw/maxresdefault.jpg' },
  { id:6, appId:2929460, title:'007 First Light', youtubeId:'J4qY9DYE184', price:'R$ 24,99', badge:'Ação Espionagem', description:'Descubra a história definitiva de origem do espião mais famoso do mundo.', cover:'https://i.ytimg.com/vi/J4qY9DYE184/maxresdefault.jpg' },
];

const CATEGORIES = ['Todos','Ação','RPG','FPS','Aventura','Estratégia','Indie','Simulação','Terror','Esportes'];

const ACCOUNTS: AccountProduct[] = [
  { id:1, title:'Conta Fortnite', subtitle:'Skins Raras + V-Bucks', price:'R$ 89,90', color:'#00D4FF', gradient:'linear-gradient(135deg,#001F6B,#003A99)' },
  { id:2, title:'Conta Valorant', subtitle:'Agentes + Skins Exclusivas', price:'R$ 79,90', color:'#FF4655', gradient:'linear-gradient(135deg,#2D0008,#5C0018)' },
  { id:3, title:'Xbox Game Pass', subtitle:'+100 Jogos por 1 Mês', price:'R$ 44,90', color:'#00CC00', gradient:'linear-gradient(135deg,#001A00,#004400)' },
  { id:4, title:'Crunchyroll Premium', subtitle:'Anime HD Sem Anúncios', price:'R$ 34,90', color:'#F78C1E', gradient:'linear-gradient(135deg,#1A0A00,#3D1E00)' },
  { id:5, title:'Netflix Premium 4K', subtitle:'Tela Extra por 30 Dias', price:'R$ 49,90', color:'#E50914', gradient:'linear-gradient(135deg,#1F0000,#4A0005)' },
  { id:6, title:'Spotify Premium', subtitle:'Música Ilimitada 1 Mês', price:'R$ 24,90', color:'#1DB954', gradient:'linear-gradient(135deg,#001A08,#003D13)' },
  { id:7, title:'Robux 1200', subtitle:'Para Usar no Roblox', price:'R$ 39,90', color:'#00B2FF', gradient:'linear-gradient(135deg,#001A2E,#003D6B)' },
  { id:8, title:'Pack de IA Premium', subtitle:'ChatGPT Plus + Midjourney', price:'R$ 59,90', color:'#A855F7', gradient:'linear-gradient(135deg,#1A0035,#3D006B)' },
];

const GAMES: Game[] = [
  { id:7, appId:990080, title:'Hogwarts Legacy', price:'R$ 7,99', category:'RPG', reviewScore:'Muito Positivo', players:'Single-player', description:'RPG de ação em mundo aberto no universo de Harry Potter.', developer:'Avalanche Software', publisher:'Warner Bros. Games', releaseDate:'10 Fev 2023', genres:['RPG','Ação','Mundo Aberto'], minReq:{ os:'Windows 10 64-bit', cpu:'Intel Core i5-6600 / AMD Ryzen 5 1400', ram:'16 GB RAM', gpu:'NVIDIA GTX 960 4GB / AMD RX 470 4GB', storage:'85 GB SSD', directX:'DirectX 12' }, recReq:{ os:'Windows 10 64-bit', cpu:'Intel Core i7-8700 / AMD Ryzen 5 3600', ram:'16 GB RAM', gpu:'NVIDIA RTX 2080Ti / AMD RX 6800 XT', storage:'85 GB SSD NVMe', directX:'DirectX 12' } },

];



/* ═══════════════════════════════════════════════════════════
   EXTRA GAMES (auto-generated from jogos.txt)
═══════════════════════════════════════════════════════════ */
// AUTO-GENERATED game seeds: [appId, title, hasDLC]
type GameSeed = [number, string, boolean];
const GAME_SEEDS: GameSeed[] = [
  [292030,"The Witcher 3: Wild Hunt",true],
  [1091500,"Cyberpunk 2077",true],
  [1086940,"Baldur's Gate 3",false],
  [1245620,"Elden Ring",true],
  [570940,"Dark Souls Remastered",true],
  [236430,"Dark Souls II",true],
  [374320,"Dark Souls III",true],
  [814380,"Sekiro: Shadows Die Twice",false],
  [1716740,"Starfield",true],
  [377160,"Fallout 4",true],
  [1151340,"Fallout 76",true],
  [489830,"Skyrim Special Edition",true],
  [1746860,"Skyrim Anniversary Edition",true],
  [22330,"The Elder Scrolls IV: Oblivion",true],
  [22320,"The Elder Scrolls III: Morrowind",true],
  [379430,"Kingdom Come: Deliverance",true],
  [1771300,"Kingdom Come: Deliverance II",true],
  [573100,"The Outer Worlds",true],
  [17450,"Dragon Age: Origins",true],
  [1238040,"Dragon Age II",true],
  [1222690,"Dragon Age: Inquisition",true],
  [1328670,"Mass Effect Legendary Edition",true],
  [1238000,"Mass Effect Andromeda",true],
  [606880,"GreedFall",true],
  [2600,"Vampire: The Masquerade",false],
  [261550,"Mount & Blade II: Bannerlord",true],
  [39510,"Gothic II",true],
  [40300,"Risen",false],
  [900040,"ELEX II",false],
  [1174180,"Red Dead Redemption 2",false],
  [271590,"Grand Theft Auto V",false],
  [12210,"Grand Theft Auto IV",true],
  [1593500,"God of War",false],
  [2322010,"God of War Ragnarök",true],
  [2215430,"Ghost of Tsushima Director's Cut",true],
  [1259420,"Days Gone",false],
  [1151640,"Horizon Zero Dawn",true],
  [2420110,"Horizon Forbidden West",true],
  [1817070,"Marvel's Spider-Man Remastered",true],
  [1817190,"Marvel's Spider-Man: Miles Morales",false],
  [2651280,"Marvel's Spider-Man 2",false],
  [1659420,"Uncharted: Legacy of Thieves Collection",false],
  [1895880,"Ratchet & Clank: Rift Apart",false],
  [1888930,"The Last of Us Part I",false],
  [1850570,"Death Stranding Director's Cut",true],
  [870780,"Control Ultimate Edition",true],
  [474960,"Quantum Break",false],
  [204100,"Max Payne 3",true],
  [307690,"Sleeping Dogs Definitive Edition",true],
  [234140,"Mad Max",false],
  [110800,"L.A. Noire",true],
  [12200,"Bully Scholarship Edition",true],
  [1030840,"Mafia Definitive Edition",false],
  [1030830,"Mafia II Definitive Edition",true],
  [360430,"Mafia III Definitive Edition",true],
  [225540,"Just Cause 3",true],
  [517630,"Just Cause 4",true],
  [379720,"DOOM",true],
  [782330,"DOOM Eternal",true],
  [2310,"Quake",true],
  [2320,"Quake II",true],
  [2210,"Quake 4",false],
  [548570,"Rage 2",true],
  [1237970,"Titanfall 2",false],
  [70,"Half-Life",false],
  [220,"Half-Life 2",true],
  [380,"Half-Life 2 Episode One",false],
  [420,"Half-Life 2 Episode Two",false],
  [362890,"Black Mesa",false],
  [550,"Left 4 Dead 2",true],
  [400,"Portal",false],
  [620,"Portal 2",false],
  [1144200,"Ready or Not",true],
  [581320,"Insurgency Sandstorm",true],
  [393380,"Squad",true],
  [3932890,"Escape from Tarkov",true],
  [4500,"S.T.A.L.K.E.R. Shadow of Chernobyl",false],
  [20510,"S.T.A.L.K.E.R. Clear Sky",false],
  [41700,"S.T.A.L.K.E.R. Call of Pripyat",false],
  [1643320,"S.T.A.L.K.E.R. 2",true],
  [286690,"Metro 2033 Redux",false],
  [287390,"Metro Last Light Redux",true],
  [412020,"Metro Exodus",true],
  [2183900,"Warhammer 40,000: Space Marine 2",true],
  [519860,"Dusk",false],
  [673130,"Amid Evil",true],
  [304240,"Resident Evil",false],
  [339340,"Resident Evil 0",false],
  [883710,"Resident Evil 2 Remake",false],
  [952060,"Resident Evil 3 Remake",false],
  [254700,"Resident Evil 4 (2007)",true],
  [2050650,"Resident Evil 4 Remake",true],
  [418370,"Resident Evil 7",true],
  [1196590,"Resident Evil Village",true],
  [3764200,"Resident Evil Requiem",false],
  [7940,"Call of Duty 4: Modern Warfare",true],
  [10090,"Call of Duty: World at War",true],
  [10180,"Call of Duty: Modern Warfare 2",true],
  [42700,"Call of Duty: Black Ops",true],
  [115300,"Call of Duty: Modern Warfare 3",true],
  [202970,"Call of Duty: Black Ops II",true],
  [209160,"Call of Duty: Ghosts",true],
  [209650,"Call of Duty: Advanced Warfare",true],
  [311210,"Call of Duty: Black Ops III",true],
  [292730,"Call of Duty: Infinite Warfare",true],
  [393080,"Call of Duty: Modern Warfare Remastered",false],
  [476600,"Call of Duty: WWII",true],
  [2000950,"Call of Duty: Modern Warfare (2019)",false],
  [1693980,"Dead Space",false],
  [47780,"Dead Space 2",true],
  [1238060,"Dead Space 3",true],
  [238320,"Outlast",true],
  [414700,"Outlast 2",false],
  [214490,"Alien: Isolation",true],
  [282140,"SOMA",false],
  [1944430,"Amnesia: The Bunker",false],
  [601430,"The Evil Within 2",false],
  [1326470,"Sons of the Forest",false],
  [242760,"The Forest",false],
  [239140,"Dying Light",true],
  [534380,"Dying Light 2",true],
  [1293830,"Forza Horizon 4",true],
  [1551360,"Forza Horizon 5",true],
  [2440510,"Forza Motorsport",true],
  [244210,"Assetto Corsa",true],
  [805550,"Assetto Corsa Competizione",true],
  [284160,"BeamNG.drive",true],
  [635260,"CarX Drift Racing Online",true],
  [690790,"Dirt Rally 2.0",true],
  [228380,"Wreckfest",true],
  [1066890,"Automobilista 2",true],
  [8930,"Civilization V",true],
  [289070,"Civilization VI",true],
  [813780,"Age of Empires II: Definitive Edition",true],
  [933110,"Age of Empires III: Definitive Edition",true],
  [1466860,"Age of Empires IV",true],
  [1934680,"Age of Mythology Retold",true],
  [1158310,"Crusader Kings III",true],
  [236850,"Europa Universalis IV",true],
  [394360,"Hearts of Iron IV",true],
  [281990,"Stellaris",true],
  [529340,"Victoria 3",true],
  [214950,"Total War: Rome II",true],
  [364360,"Total War: Warhammer",true],
  [594570,"Total War: Warhammer II",true],
  [1142710,"Total War: Warhammer III",true],
  [231430,"Company of Heroes 2",true],
  [268500,"XCOM 2",true],
  [506140,"Frostpunk",true],
  [1601580,"Frostpunk 2",true],
  [976310,"Mortal Kombat 11",true],
  [1971870,"Mortal Kombat 1",true],
  [389730,"Tekken 7",true],
  [1778820,"Tekken 8",true],
  [310950,"Street Fighter V",true],
  [1364780,"Street Fighter 6",true],
  [1384160,"Guilty Gear Strive",true],
  [678950,"Dragon Ball FighterZ",true],
  [349040,"Naruto Ultimate Ninja Storm 4",true],
  [544750,"Soulcalibur VI",true],
  [524220,"NieR: Automata",true],
  [1113560,"NieR Replicant",false],
  [921570,"Octopath Traveler",false],
  [1971650,"Octopath Traveler II",false],
  [1850510,"Triangle Strategy",false],
  [2014380,"Live A Live",false],
  [2238900,"Star Ocean: The Second Story R",false],
  [1113000,"Persona 4 Golden",false],
  [1687950,"Persona 5 Royal",false],
  [740130,"Tales of Arise",true],
  [738540,"Tales of Vesperia",true],
  [579180,"Ys VIII",true],
  [1351630,"Ys IX",true],
  [2555540,"Ys X: Nordics",true],
  [595520,"Final Fantasy XII: The Zodiac Age",false],
  [359870,"Final Fantasy X/X-2 HD Remaster",false],
  [377840,"Final Fantasy IX",false],
  [1026680,"Final Fantasy VIII Remastered",false],
  [1133760,"Chrono Cross: Radical Dreamers Edition",false],
  [1295510,"Dragon Quest XI S",false],
  [553850,"Helldivers 2",true],
  [1623730,"Palworld",false],
  [892970,"Valheim",false],
  [548430,"Deep Rock Galactic",true],
  [108600,"Project Zomboid",false],
  [1172620,"Sea of Thieves",true],
  [962130,"Grounded",false],
  [1203620,"Enshrouded",false],
  [1604030,"V Rising",true],
  [275850,"No Man's Sky",false],
  [238960,"Path of Exile",false],
  [1145360,"Hades",false],
  [1145350,"Hades II",false],
  [367520,"Hollow Knight",true],
  [1030300,"Hollow Knight: Silksong",false],
  [504230,"Celeste",false],
  [413150,"Stardew Valley",false],
  [105600,"Terraria",false],
  [588650,"Dead Cells",true],
  [268910,"Cuphead",true],
  [261570,"Ori and the Blind Forest",false],
  [1057090,"Ori and the Will of the Wisps",false],
  [2379780,"Balatro",false],
  [1868140,"Dave the Diver",true],
  [1794680,"Vampire Survivors",true],
  [1966720,"Lethal Company",false],
  [294100,"RimWorld",true],
  [427520,"Factorio",true],
  [526870,"Satisfactory",false],
  [646570,"Slay the Spire",false],
  [391540,"Undertale",false],
  [1671210,"Deltarune",false],
  [264710,"Subnautica",false],
  [848450,"Subnautica: Below Zero",false],
  [457140,"Oxygen Not Included",true],
  [311560,"Assassin's Creed Rogue",false],
  [289650,"Assassin's Creed Unity",true],
  [368500,"Assassin's Creed Syndicate",true],
  [298110,"Far Cry 4",true],
  [371660,"Far Cry Primal",true],
  [552520,"Far Cry 5",true],
  [939960,"Far Cry New Dawn",false],
  [243470,"Watch Dogs",true],
  [447040,"Watch Dogs 2",true],
  [35140,"Batman: Arkham Asylum",true],
  [200260,"Batman: Arkham City",true],
  [209000,"Batman: Arkham Origins",true],
  [208650,"Batman: Arkham Knight",true],
  [7670,"BioShock",false],
  [8850,"BioShock 2",false],
  [8870,"BioShock Infinite",true],
  [201810,"Wolfenstein: The New Order",false],
  [350080,"Wolfenstein: The Old Blood",false],
  [612880,"Wolfenstein II: The New Colossus",true],
  [205100,"Dishonored",true],
  [403640,"Dishonored 2",false],
  [614570,"Dishonored: Death of the Outsider",false],
  [7000,"Tomb Raider: Legend",false],
  [8000,"Tomb Raider: Anniversary",false],
  [8140,"Tomb Raider: Underworld",true],
  [203160,"Tomb Raider (2013)",true],
  [391220,"Rise of the Tomb Raider",true],
  [750920,"Shadow of the Tomb Raider",true],
  [1328660,"Need for Speed: Hot Pursuit Remastered",true],
  [1262560,"Need for Speed: Most Wanted",true],
  [1262580,"Need for Speed Rivals",true],
  [1262540,"Need for Speed (2015)",true],
  [1262570,"Need for Speed Payback",true],
  [1222680,"Need for Speed Heat",true],
  [227300,"Euro Truck Simulator 2",true],
  [270880,"American Truck Simulator",true],
  [1248130,"Farming Simulator 22",true],
  [1465360,"SnowRunner",true],
  [675010,"MudRunner",true],
  [220200,"Kerbal Space Program",true],
  [954850,"Kerbal Space Program 2",false],
  [233450,"Prison Architect",true],
  [255710,"Cities: Skylines",true],
  [949230,"Cities: Skylines II",true],
  [2140020,"Stronghold Definitive Edition",false],
  [40970,"Stronghold Crusader HD",false],
  [232890,"Stronghold Crusader 2",true],
  [245620,"Tropico 5",true],
  [492720,"Tropico 6",true],
  [21090,"F.E.A.R.",false],
  [16450,"F.E.A.R. 2",false],
  [21100,"F.E.A.R. 3",true],
  [274520,"Darkwood",false],
  [391720,"Layers of Fear",false],
  [1029890,"Layers of Fear 2",false],
  [594330,"Visage",false],
  [424840,"Little Nightmares",true],
  [860510,"Little Nightmares II",false],
  [9010,"Return to Castle Wolfenstein",false],
  [1142400,"Soldier of Fortune",false],
  [1142410,"Soldier of Fortune II",false],
  [13250,"Unreal Gold",false],
  [13230,"Unreal Tournament 3",true],
  [41000,"Serious Sam HD: The First Encounter",false],
  [204340,"Serious Sam 2",false],
  [41070,"Serious Sam 3: BFE",true],
  [257420,"Serious Sam 4",true],
  [648800,"Raft",false],
  [815370,"Green Hell",true],
  [1409830,"Sons of Valhalla",false],
  [440900,"Conan Exiles",true],
  [1641960,"Forever Skies",false],
  [1159690,"Voidtrain",false],
  [1766060,"HumanitZ",false],
  [250900,"The Binding of Isaac: Rebirth",true],
  [1942280,"Brotato",true],
  [241600,"Rogue Legacy",false],
  [1253920,"Rogue Legacy 2",false],
  [250760,"Shovel Knight: Treasure Trove",false],
  [460950,"Katana ZERO",false],
  [774361,"Blasphemous",true],
  [2114740,"Blasphemous 2",true],
  [764790,"The Messenger",false],
  [1055540,"A Short Hike",false],
  [304430,"Inside",false],
  [48000,"Limbo",false],
  [1041720,"Kingdoms of Amalur: Re-Reckoning",true],
  [7520,"Two Worlds II",true],
  [225640,"Sacred 2 Gold",true],
  [247950,"Sacred 3",true],
  [288470,"Fable Anniversary",false],
  [105400,"Fable III",true],
  [367500,"Dragon's Dogma: Dark Arisen",true],
  [794260,"Outward",true],
  [1527950,"Wartales",true],
  [987840,"Expeditions: Rome",true],
  [445190,"Expeditions: Viking",false],
  [640820,"Pathfinder: Kingmaker",true],
  [1184370,"Pathfinder: Wrath of the Righteous",true],
  [291650,"Pillars of Eternity",true],
  [560130,"Pillars of Eternity II: Deadfire",true],
  [362960,"Tyranny",true],
  [1096530,"Solasta: Crown of the Magister",true],
  [240760,"Wasteland 2",true],
  [719040,"Wasteland 3",true],
  [552620,"ATOM RPG",false],
  [241540,"State of Decay",true],
  [495420,"State of Decay 2",true],
  [847370,"Sunset Overdrive",false],
  [10150,"Prototype",false],
  [115320,"Prototype 2",true],
  [9480,"Saints Row 2",false],
  [1383010,"Saints Row: The Third Remastered",true],
  [206420,"Saints Row IV",true],
  [383150,"Dead Island Definitive Edition",true],
  [383180,"Dead Island Riptide Definitive Edition",true],
  [2342710,"Dead Island 2",true],
  [302510,"Ryse: Son of Rome",false],
  [50300,"Spec Ops: The Line",false],
  [24880,"The Saboteur",false],
  [24700,"Mercenaries 2",false],
  [378540,"The Surge",true],
  [644830,"The Surge 2",true],
  [265300,"Lords of the Fallen (2014)",true],
  [204450,"Call of Juarez: Gunslinger",false],
  [21980,"Call of Juarez: Bound in Blood",false],
  [42670,"Singularity",false],
  [501590,"Bulletstorm Full Clip Edition",true],
  [1222370,"Necromunda: Hired Gun",true],
  [964800,"Prodeus",true],
  [562860,"Ion Fury",true],
  [1328900,"Turbo Overkill",false],
  [1164940,"Trepang2",true],
  [954740,"Terminator: Resistance",true],
  [1593480,"Forgive Me Father",true],
  [2272250,"Forgive Me Father 2",false],
  [1536420,"HROT",false],
  [1684930,"Cultic",false],
  [223470,"Postal 2",true],
  [1359890,"Postal: Brain Damaged",true],
  [2061230,"Chasm: The Rift",false],
  [1367590,"Tormented Souls",false],
  [1262350,"Signalis",false],
  [1096570,"Song of Horror",false],
  [1017900,"Maid of Sker",false],
  [296710,"Monstrum",true],
  [1386900,"Observer: System Redux",false],
  [399810,"Call of Cthulhu",false],
  [313780,"Conarium",false],
  [1012840,"Moons of Madness",false],
  [792300,"The Beast Inside",false],
  [12360,"FlatOut: Ultimate Carnage",false],
  [2990,"FlatOut 2",false],
  [1238080,"Burnout Paradise Remastered",true],
  [99910,"Test Drive Unlimited",false],
  [9930,"Test Drive Unlimited 2",true],
  [211500,"RaceRoom Racing Experience Premium",true],
  [234630,"Project CARS",true],
  [2699310,"Clair Obscur: Expedition 33",false],
  [2054970,"Dragon's Dogma 2",true],
  [2246340,"Monster Hunter Wilds",true],
  [2623190,"The Elder Scrolls IV: Oblivion Remastered",false],
  [2425850,"Metaphor: ReFantazio",false],
  [632470,"Disco Elysium",false],
  [3506430,"PEAK",false],
  [3241660,"R.E.P.O.",false],
  [2661300,"Grounded 2",false],
  [958520,"33 Immortals",false],
  [1649240,"Returnal",false],
  [1599660,"Sackboy: A Big Adventure",false],
  [2172010,"Until Dawn",false],
  [2161700,"Persona 3 Reload",true],
  [2515020,"Final Fantasy XVI",true],
  [1462040,"Final Fantasy VII Remake Intergrade",true],
  [2909400,"Final Fantasy VII Rebirth",true],
  [2124490,"Silent Hill 2 (Remake)",false],
  [2439620,"Still Wakes the Deep",true],
  [2186680,"Warhammer 40,000: Rogue Trader",true],
  [1336490,"Against the Storm",true],
  [784150,"Workers & Resources: Soviet Republic",true],
  [653530,"Return of the Obra Dinn",false],
  [813230,"Animal Well",false],
  [1809540,"Nine Sols",false],
  [1497440,"Cocoon",false],
  [1562430,"Dredge",true],
  [3321460,"Crimson Desert",false],
  [1962700,"Subnautica 2",false],
  [2769570,"Fable (Novo)",false],
  [1297900,"Gothic 1 Remake",false],
  [3010850,"Gears of War: E-Day",false],
  [3065800,"Marathon",false],
  [2868840,"Slay the Spire II",false],
  [2416450,"Mouse: P.I. For Hire",false],
  [2975950,"Solasta II",false],
  [2358720,"Black Myth: Wukong",false],
  [1627720,"Lies of P",true],
  [1501750,"Lords of the Fallen (2023)",true],
  [1361210,"Warhammer 40,000: Darktide",true],
  [1458140,"Pacific Drive",false],
  [1493640,"Banishers: Ghosts of New Eden",false],
  [1832040,"Flintlock: The Siege of Dawn",false],
  [2457220,"Avowed",false],
  [835960,"The Talos Principle 2",true],
  [482400,"System Shock (Remake)",false],
  [1084160,"Jagged Alliance 3",true],
  [1150440,"Aliens: Dark Descent",false],
  [1545560,"Shadow Gambit: The Cursed Crew",false],
  [1669000,"Age of Wonders 4",true],
  [1363080,"Manor Lords",false],
  [466560,"Northgard",true],
  [1244460,"Jurassic World Evolution 2",true],
  [1644320,"Railway Empire 2",true],
  [1190970,"House Flipper 2",false],
  [1149620,"Gas Station Simulator",true],
  [1290000,"PowerWash Simulator",true],
  [1190000,"Car Mechanic Simulator 2021",true],
  [756800,"Contraband Police",false],
  [2670630,"Supermarket Simulator",false],
  [2139460,"Once Human",false],
  [2646460,"Soulmask",false],
  [1928980,"Nightingale",false],
  [2071500,"Ravenswatch",true],
  [3393430,"Ravenswatch: Nightmares Unleashed",true],
  [1869590,"Inkulinati",false],
  [1172140,"Songs of Conquest",true],
  [3335020,"Wartales: The Skelmar Invasion",true],
  [1621690,"Core Keeper",false],
  [1321450,"Cassette Beasts",true],
  [1658150,"Moonstone Island",false],
  [986130,"Shadows of Doubt",false],
  [1592280,"Selaco",false],
  [410830,"Lego Batman",false],
  [1203220,"Pragmata",false],
  [2929460,"007 First Light",false],
];

const CATEGORY_KEYWORDS: Array<[string, RegExp]> = [
  ['Terror', /resident evil|silent hill|outlast|alien:|amnesia|soma|layers of fear|visage|dead space|evil within|tormented souls|signalis|maid of sker|call of cthulhu|conarium|moons of madness|beast inside|f\.e\.a\.r|darkwood|little nightmares|observer:|monstrum|song of horror|crow country|still wakes the deep/i],
  ['FPS', /doom|quake|call of duty|half-life|counter-strike|wolfenstein|bioshock|far cry|titanfall|black mesa|left 4 dead|portal|ready or not|insurgency|squad|escape from tarkov|s\.t\.a\.l\.k\.e\.r|stalker|metro |space marine|dusk|amid evil|ultrakill|turbo overkill|prodeus|ion fury|trepang|robocop|terminator|forgive me father|hrot|cultic|postal|chasm|return to castle|soldier of fortune|unreal|serious sam|bulletstorm|necromunda|hard reset|singularity|spec ops|selaco/i],
  ['RPG', /witcher|elden ring|dark souls|baldur|cyberpunk|fallout|skyrim|elder scrolls|kingdom come|outer worlds|dragon age|mass effect|greedfall|vampire: the masquerade|gothic|risen|elex|persona|final fantasy|nier|octopath|triangle strategy|live a live|star ocean|tales of|ys |dragon quest|black myth|lies of p|lords of the fallen|remnant|darktide|pacific drive|banishers|flintlock|avowed|talos principle|rogue trader|atom rpg|wasteland|tyranny|pillars of eternity|solasta|pathfinder|expeditions|outward|wartales|dragon's dogma|fable|sacred|two worlds|kingdoms of amalur|surge|metaphor|disco elysium|clair obscur|monster hunter|nioh|code vein|sekiro|beast of reincarnation|phantom blade/i],
  ['Estratégia', /civilization|total war|age of empires|age of mythology|crusader kings|europa universalis|hearts of iron|stellaris|victoria 3|company of heroes|xcom|frostpunk|cities: skylines|stronghold|tropico|prison architect|jagged alliance|songs of conquest|northgard|against the storm|workers & resources|age of wonders|manor lords|shadow gambit|aliens: dark descent|inkulinati|railway empire|jurassic world evolution/i],
  ['Simulação', /forza|assetto|beamng|carx|dirt rally|wreckfest|automobilista|need for speed|euro truck|american truck|farming|snowrunner|mudrunner|train sim|kerbal|burnout|flatout|test drive|raceroom|project cars|house flipper|gas station|pc building|powerwash|car mechanic|contraband police|supermarket simulator|hytale|once human|soulmask|nightingale|enshrouded|grounded|core keeper|valheim|palworld|abiotic factor|forever skies|voidtrain|humanitz|raft|green hell|conan exiles|the forest|sons of the forest|subnautica|satisfactory|factorio|rimworld|oxygen not included|sea of thieves|rust|ark:|v rising|no man's sky|warframe|path of exile|cassette beasts|moonstone island|shadows of doubt/i],
  ['Indie', /stardew|terraria|hollow knight|hades|celeste|dead cells|cuphead|ori |balatro|dave the diver|vampire survivors|lethal company|slay the spire|undertale|deltarune|binding of isaac|brotato|rogue legacy|shovel knight|katana zero|blasphemous|messenger|short hike|inside|limbo|return of the obra dinn|animal well|nine sols|pizza tower|cocoon|dredge|peak|r\.e\.p\.o\.|33 immortals|ravenswatch/i],
  ['Aventura', /tomb raider|uncharted|last of us|god of war|spider-man|ratchet|days gone|horizon|ghost of tsushima|death stranding|control|alan wake|quantum break|max payne|sleeping dogs|mad max|l\.a\. noire|bully|mafia|just cause|grand theft auto|red dead|watch dogs|assassin's creed|batman|dishonored|yakuza|like a dragon|state of decay|sunset overdrive|prototype|saints row|dead island|ryse|enslaved|saboteur|mercenaries|call of juarez|returnal|sackboy|until dawn|crimson desert|lego batman|007|wolverine|gears of war|star wars|blood of the dawnwalker|replaced|marathon|neverness|arknights|dying light|helldivers|sons of valhalla/i],
];

function categorizeTitle(title: string): string {
  for (const [cat, rx] of CATEGORY_KEYWORDS) {
    if (rx.test(title)) return cat;
  }
  return 'Ação';
}

const DEFAULT_MIN_REQ: Requirements = {
  os: 'Windows 10 64-bit',
  cpu: 'Intel Core i5-4460 / AMD Ryzen 3 1200',
  ram: '8 GB RAM',
  gpu: 'NVIDIA GTX 960 4GB / AMD RX 470 4GB',
  storage: '50 GB',
  directX: 'DirectX 11'
};
const DEFAULT_REC_REQ: Requirements = {
  os: 'Windows 10/11 64-bit',
  cpu: 'Intel Core i7-8700K / AMD Ryzen 5 3600',
  ram: '16 GB RAM',
  gpu: 'NVIDIA RTX 2060 / AMD RX 5700',
  storage: '50 GB SSD',
  directX: 'DirectX 12'
};

function expandSeed(seed: GameSeed, baseId: number): Game {
  const [appId, title, hasDLC] = seed;
  const cat = categorizeTitle(title);

  // Preços baseados na lista de preços oficial
  const PRICE_MAP: Record<string, [string, string | null]> = {
    '007 First Light': ['R$ 34,00', null],
    '33 Immortals': ['R$ 20,00', null],
    'A Short Hike': ['R$ 9,99', null],
    'ATOM RPG': ['R$ 10,00', null],
    'Against the Storm': ['R$ 19,99', 'R$ 21,99'],
    'Age of Empires II: Definitive Edition': ['R$ 19,99', 'R$ 21,99'],
    'Age of Empires III: Definitive Edition': ['R$ 19,99', 'R$ 21,99'],
    'Age of Empires IV': ['R$ 28,00', 'R$ 50,00'],
    'Age of Mythology Retold': ['R$ 15,99', 'R$ 34,99'],
    'Age of Wonders 4': ['R$ 15,99', 'R$ 34,99'],
    'Alien: Isolation': ['R$ 9,99', 'R$ 29,99'],
    'Aliens: Dark Descent': ['R$ 12,89', null],
    'American Truck Simulator': ['R$ 10,00', 'R$ 34,99'],
    'Amid Evil': ['R$ 15,00', 'R$ 27,99'],
    'Amnesia: The Bunker': ['R$ 27,89', null],
    'Animal Well': ['R$ 10,00', null],
    "Assassin's Creed Rogue": ['R$ 9,99', null],
    "Assassin's Creed Syndicate": ['R$ 8,00', 'R$ 10,00'],
    "Assassin's Creed Unity": ['R$ 12,00', 'R$ 15,00'],
    'Assetto Corsa': ['R$ 9,99', 'R$ 15,99'],
    'Assetto Corsa Competizione': ['R$ 10,00', 'R$ 14,99'],
    'Automobilista 2': ['R$ 13,99', 'R$ 17,99'],
    'Avowed': ['R$ 9,99', null],
    'Balatro': ['R$ 9,99', null],
    "Baldur's Gate 3": ['R$ 13,00', null],
    'Banishers: Ghosts of New Eden': ['R$ 8,99', null],
    'Batman: Arkham Asylum': ['R$ 9,99', 'R$ 12,99'],
    'Batman: Arkham City': ['R$ 9,99', 'R$ 12,99'],
    'Batman: Arkham Knight': ['R$ 9,99', 'R$ 12,99'],
    'Batman: Arkham Origins': ['R$ 9,99', 'R$ 12,99'],
    'BeamNG.drive': ['R$ 2,99', 'R$ 9,99'],
    'BioShock': ['R$ 8,99', null],
    'BioShock 2': ['R$ 8,99', null],
    'BioShock Infinite': ['R$ 10,00', 'R$ 12,99'],
    'Black Mesa': ['R$ 5,99', null],
    'Black Myth: Wukong': ['R$ 30,00', null],
    'Blasphemous': ['R$ 20,00', 'R$ 25,00'],
    'Blasphemous 2': ['R$ 20,00', 'R$ 25,00'],
    'Brotato': ['R$ 10,00', 'R$ 12,99'],
    'Bully Scholarship Edition': ['R$ 5,99', 'R$ 12,99'],
    'Burnout Paradise Remastered': ['R$ 5,99', 'R$ 12,99'],
    'Call of Cthulhu': ['R$ 5,99', null],
    'Call of Duty 4: Modern Warfare': ['R$ 5,99', 'R$ 12,99'],
    'Call of Duty: Advanced Warfare': ['R$ 6,99', 'R$ 14,99'],
    'Call of Duty: Black Ops': ['R$ 6,99', 'R$ 14,99'],
    'Call of Duty: Black Ops II': ['R$ 6,99', 'R$ 14,99'],
    'Call of Duty: Black Ops III': ['R$ 7,99', 'R$ 15,99'],
    'Call of Duty: Ghosts': ['R$ 6,99', 'R$ 14,99'],
    'Call of Duty: Infinite Warfare': ['R$ 7,99', 'R$ 15,99'],
    'Call of Duty: Modern Warfare (2019)': ['R$ 8,99', null],
    'Call of Duty: Modern Warfare 2': ['R$ 6,99', 'R$ 14,99'],
    'Call of Duty: Modern Warfare 3': ['R$ 6,99', 'R$ 14,99'],
    'Call of Duty: Modern Warfare Remastered': ['R$ 6,99', null],
    'Call of Duty: WWII': ['R$ 7,99', 'R$ 15,99'],
    'Call of Duty: World at War': ['R$ 5,99', 'R$ 12,99'],
    'Call of Juarez: Bound in Blood': ['R$ 4,99', null],
    'Call of Juarez: Gunslinger': ['R$ 4,99', null],
    'Car Mechanic Simulator 2021': ['R$ 5,99', 'R$ 12,99'],
    'CarX Drift Racing Online': ['R$ 4,99', 'R$ 10,99'],
    'Cassette Beasts': ['R$ 4,99', 'R$ 10,99'],
    'Celeste': ['R$ 4,99', null],
    'Chasm: The Rift': ['R$ 4,99', null],
    'Chrono Cross: Radical Dreamers Edition': ['R$ 5,99', null],
    'Cities: Skylines': ['R$ 6,99', 'R$ 10,00'],
    'Cities: Skylines II': ['R$ 8,99', 'R$ 10,00'],
    'Civilization V': ['R$ 5,99', 'R$ 9,99'],
    'Civilization VI': ['R$ 6,99', 'R$ 9,99'],
    'Clair Obscur: Expedition 33': ['R$ 8,99', null],
    'Cocoon': ['R$ 5,99', null],
    'Company of Heroes 2': ['R$ 5,99', 'R$ 12,99'],
    'Conan Exiles': ['R$ 6,99', 'R$ 14,99'],
    'Conarium': ['R$ 4,99', null],
    'Contraband Police': ['R$ 5,99', null],
    'Control Ultimate Edition': ['R$ 6,99', 'R$ 14,99'],
    'Core Keeper': ['R$ 5,99', null],
    'Crimson Desert': ['R$ 8,99', null],
    'Crusader Kings III': ['R$ 7,99', 'R$ 15,99'],
    'Cultic': ['R$ 4,99', null],
    'Cuphead': ['R$ 4,99', 'R$ 10,99'],
    'Cyberpunk 2077': ['R$ 8,99', 'R$ 17,99'],
    'DOOM': ['R$ 5,99', 'R$ 12,99'],
    'DOOM Eternal': ['R$ 7,99', 'R$ 15,99'],
    'Dark Souls II': ['R$ 10,99', 'R$ 14,99'],
    'Dark Souls III': ['R$ 10,99', 'R$ 15,99'],
    'Dark Souls Remastered': ['R$ 10,99', 'R$ 14,99'],
    'Darkwood': ['R$ 4,99', null],
    'Dave the Diver': ['R$ 5,99', 'R$ 12,99'],
    'Days Gone': ['R$ 7,99', null],
    'Dead Cells': ['R$ 5,99', 'R$ 12,99'],
    'Dead Island 2': ['R$ 7,99', 'R$ 15,99'],
    'Dead Island Definitive Edition': ['R$ 4,99', 'R$ 10,99'],
    'Dead Island Riptide Definitive Edition': ['R$ 4,99', 'R$ 10,99'],
    'Dead Space': ['R$ 5,99', null],
    'Dead Space 2': ['R$ 5,99', 'R$ 12,99'],
    'Dead Space 3': ['R$ 5,99', 'R$ 12,99'],
    "Death Stranding Director's Cut": ['R$ 7,99', 'R$ 15,99'],
    'Deep Rock Galactic': ['R$ 5,99', 'R$ 12,99'],
    'Deltarune': ['R$ 3,99', null],
    'Dirt Rally 2.0': ['R$ 5,99', 'R$ 12,99'],
    'Disco Elysium': ['R$ 5,99', null],
    'Dishonored': ['R$ 4,99', 'R$ 10,99'],
    'Dishonored 2': ['R$ 5,99', null],
    'Dishonored: Death of the Outsider': ['R$ 5,99', null],
    'Dragon Age II': ['R$ 5,99', 'R$ 12,99'],
    'Dragon Age: Inquisition': ['R$ 6,99', 'R$ 14,99'],
    'Dragon Age: Origins': ['R$ 5,99', 'R$ 12,99'],
    'Dragon Ball FighterZ': ['R$ 6,99', 'R$ 14,99'],
    'Dragon Quest XI S': ['R$ 7,99', null],
    "Dragon's Dogma 2": ['R$ 8,99', 'R$ 17,99'],
    "Dragon's Dogma: Dark Arisen": ['R$ 5,99', 'R$ 12,99'],
    'Dredge': ['R$ 5,99', 'R$ 12,99'],
    'Dusk': ['R$ 4,99', null],
    'Dying Light': ['R$ 5,99', 'R$ 12,99'],
    'Dying Light 2': ['R$ 7,99', 'R$ 15,99'],
    'ELEX II': ['R$ 6,99', null],
    'Elden Ring': ['R$ 15,99', 'R$ 19,99'],
    'Enshrouded': ['R$ 6,99', null],
    'Escape from Tarkov': ['R$ 19,99', 'R$ 17,99'],
    'Euro Truck Simulator 2': ['R$ 5,99', 'R$ 10,99'],
    'Europa Universalis IV': ['R$ 6,99', 'R$ 10,99'],
    'Expeditions: Rome': ['R$ 6,99', 'R$ 10,99'],
    'Expeditions: Viking': ['R$ 5,99', null],
    'F.E.A.R.': ['R$ 4,99', null],
    'F.E.A.R. 2': ['R$ 4,99', null],
    'F.E.A.R. 3': ['R$ 4,99', 'R$ 6,99'],
    'Fable (Novo)': ['R$ 8,99', null],
    'Fable Anniversary': ['R$ 5,99', null],
    'Fable III': ['R$ 5,99', 'R$ 12,99'],
    'Factorio': ['R$ 6,99', 'R$ 14,99'],
    'Fallout 4': ['R$ 5,99', 'R$ 12,99'],
    'Fallout 76': ['R$ 5,99', 'R$ 12,99'],
    'Far Cry 4': ['R$ 5,99', 'R$ 12,99'],
    'Far Cry 5': ['R$ 6,99', 'R$ 14,99'],
    'Far Cry New Dawn': ['R$ 10,00', null],
    'Far Cry Primal': ['R$ 5,99', 'R$ 9,99'],
    'Farming Simulator 22': ['R$ 6,99', 'R$ 14,99'],
    'Final Fantasy IX': ['R$ 4,99', null],
    'Final Fantasy VII Rebirth': ['R$ 8,99', 'R$ 17,99'],
    'Final Fantasy VII Remake Intergrade': ['R$ 7,99', 'R$ 15,99'],
    'Final Fantasy VIII Remastered': ['R$ 4,99', null],
    'Final Fantasy X/X-2 HD Remaster': ['R$ 5,99', null],
    'Final Fantasy XII: The Zodiac Age': ['R$ 6,99', null],
    'Final Fantasy XVI': ['R$ 8,99', 'R$ 17,99'],
    'FlatOut 2': ['R$ 3,99', null],
    'FlatOut: Ultimate Carnage': ['R$ 4,99', null],
    'Flintlock: The Siege of Dawn': ['R$ 6,99', null],
    'Forever Skies': ['R$ 5,99', null],
    'Forgive Me Father': ['R$ 4,99', 'R$ 10,99'],
    'Forgive Me Father 2': ['R$ 5,99', null],
    'Forza Horizon 4': ['R$ 6,99', 'R$ 9,99'],
    'Forza Horizon 5': ['R$ 7,99', 'R$ 9,99'],
    'Forza Motorsport': ['R$ 7,99', 'R$ 9,99'],
    'Frostpunk': ['R$ 5,99', 'R$ 12,99'],
    'Frostpunk 2': ['R$ 7,99', 'R$ 15,99'],
    'Gas Station Simulator': ['R$ 4,99', 'R$ 10,99'],
    'Gears of War: E-Day': ['R$ 8,99', null],
    "Ghost of Tsushima Director's Cut": ['R$ 7,99', 'R$ 15,99'],
    'God of War': ['R$ 7,99', null],
    'God of War Ragnarök': ['R$ 8,99', 'R$ 13,99'],
    'Gothic 1 Remake': ['R$ 7,99', null],
    'Gothic II': ['R$ 3,99', 'R$ 8,99'],
    'Grand Theft Auto IV': ['R$ 5,99', 'R$ 12,99'],
    'Grand Theft Auto V': ['R$ 6,99', null],
    'GreedFall': ['R$ 5,99', 'R$ 12,99'],
    'Green Hell': ['R$ 5,99', 'R$ 12,99'],
    'Grounded': ['R$ 6,99', null],
    'Grounded 2': ['R$ 7,99', null],
    'Guilty Gear Strive': ['R$ 6,99', 'R$ 14,99'],
    'HROT': ['R$ 4,99', null],
    'Hades': ['R$ 5,99', null],
    'Hades II': ['R$ 6,99', null],
    'Half-Life': ['R$ 3,99', null],
    'Half-Life 2': ['R$ 3,99', 'R$ 5,00'],
    'Half-Life 2 Episode One': ['R$ 3,99', null],
    'Half-Life 2 Episode Two': ['R$ 3,99', null],
    'Hearts of Iron IV': ['R$ 6,99', 'R$ 14,99'],
    'Helldivers 2': ['R$ 7,99', 'R$ 15,99'],
    'Hogwarts Legacy': ['R$ 7,99', null],
    'Hollow Knight': ['R$ 4,99', null],
    'Hollow Knight: Silksong': ['R$ 5,99', null],
    'Horizon Forbidden West': ['R$ 7,99', 'R$ 15,99'],
    'Horizon Zero Dawn': ['R$ 6,99', 'R$ 14,99'],
    'House Flipper 2': ['R$ 5,99', null],
    'HumanitZ': ['R$ 4,99', null],
    'Inkulinati': ['R$ 4,99', null],
    'Inside': ['R$ 4,99', null],
    'Insurgency Sandstorm': ['R$ 5,99', 'R$ 12,99'],
    'Ion Fury': ['R$ 4,99', 'R$ 10,99'],
    'Jagged Alliance 3': ['R$ 6,99', 'R$ 14,99'],
    'Jurassic World Evolution 2': ['R$ 6,99', 'R$ 14,99'],
    'Just Cause 3': ['R$ 4,99', 'R$ 10,99'],
    'Just Cause 4': ['R$ 5,99', 'R$ 12,99'],
    'Katana ZERO': ['R$ 4,99', null],
    'Kerbal Space Program': ['R$ 5,99', 'R$ 12,99'],
    'Kerbal Space Program 2': ['R$ 6,99', null],
    'Kingdom Come: Deliverance': ['R$ 5,99', 'R$ 12,99'],
    'Kingdom Come: Deliverance II': ['R$ 8,99', 'R$ 17,99'],
    'Kingdoms of Amalur: Re-Reckoning': ['R$ 5,99', 'R$ 12,99'],
    'L.A. Noire': ['R$ 5,99', 'R$ 12,99'],
    'Layers of Fear': ['R$ 5,99', null],
    'Layers of Fear 2': ['R$ 5,99', null],
    'Left 4 Dead 2': ['R$ 3,99', 'R$ 8,99'],
    'Lego Batman': ['R$ 4,99', null],
    'Lethal Company': ['R$ 4,99', null],
    'Lies of P': ['R$ 7,99', 'R$ 15,99'],
    'Limbo': ['R$ 3,99', null],
    'Little Nightmares': ['R$ 4,99', 'R$ 10,99'],
    'Little Nightmares II': ['R$ 5,99', null],
    'Live A Live': ['R$ 6,99', null],
    'Lords of the Fallen (2014)': ['R$ 4,99', 'R$ 10,99'],
    'Lords of the Fallen (2023)': ['R$ 7,99', 'R$ 15,99'],
    'Mad Max': ['R$ 4,99', null],
    'Mafia Definitive Edition': ['R$ 5,99', null],
    'Mafia II Definitive Edition': ['R$ 5,99', 'R$ 12,99'],
    'Mafia III Definitive Edition': ['R$ 5,99', 'R$ 12,99'],
    'Maid of Sker': ['R$ 4,99', null],
    'Manor Lords': ['R$ 6,99', null],
    'Marathon': ['R$ 6,99', null],
    "Marvel's Spider-Man 2": ['R$ 12,99', null],
    "Marvel's Spider-Man Remastered": ['R$ 12,99', 'R$ 15,99'],
    "Marvel's Spider-Man: Miles Morales": ['R$ 12,99', null],
    'Mass Effect Andromeda': ['R$ 5,99', 'R$ 12,99'],
    'Mass Effect Legendary Edition': ['R$ 7,99', 'R$ 15,99'],
    'Max Payne 3': ['R$ 5,99', 'R$ 7,99'],
    'Mercenaries 2': ['R$ 4,99', null],
    'Metaphor: ReFantazio': ['R$ 8,99', null],
    'Metro 2033 Redux': ['R$ 4,99', null],
    'Metro Exodus': ['R$ 6,99', 'R$ 14,99'],
    'Metro Last Light Redux': ['R$ 4,99', 'R$ 10,99'],
    'Monster Hunter Wilds': ['R$ 8,99', 'R$ 17,99'],
    'Monstrum': ['R$ 3,99', 'R$ 8,99'],
    'Moons of Madness': ['R$ 4,99', null],
    'Moonstone Island': ['R$ 4,99', null],
    'Mortal Kombat 1': ['R$ 10,99', 'R$ 17,99'],
    'Mortal Kombat 11': ['R$ 10,99', 'R$ 17,99'],
    'Mount & Blade II: Bannerlord': ['R$ 6,99', 'R$ 14,99'],
    'Mouse: P.I. For Hire': ['R$ 5,99', null],
    'MudRunner': ['R$ 4,99', 'R$ 10,99'],
    'Naruto Ultimate Ninja Storm 4': ['R$ 5,99', 'R$ 12,99'],
    'Necromunda: Hired Gun': ['R$ 5,99', 'R$ 12,99'],
    'Need for Speed (2015)': ['R$ 5,99', 'R$ 12,99'],
    'Need for Speed Heat': ['R$ 6,99', 'R$ 9,99'],
    'Need for Speed Payback': ['R$ 5,99', 'R$ 9,99'],
    'Need for Speed Rivals': ['R$ 5,99', 'R$ 9,99'],
    'Need for Speed: Hot Pursuit Remastered': ['R$ 5,99', 'R$ 9,99'],
    'Need for Speed: Most Wanted': ['R$ 4,99', 'R$ 9,99'],
    'NieR Replicant': ['R$ 6,99', null],
    'NieR: Automata': ['R$ 6,99', 'R$ 14,99'],
    'Nightingale': ['R$ 5,99', null],
    'Nine Sols': ['R$ 5,99', null],
    "No Man's Sky": ['R$ 6,99', null],
    'Northgard': ['R$ 4,99', 'R$ 10,99'],
    'Observer: System Redux': ['R$ 5,99', null],
    'Octopath Traveler': ['R$ 6,99', null],
    'Octopath Traveler II': ['R$ 7,99', null],
    'Once Human': ['R$ 5,99', null],
    'Ori and the Blind Forest': ['R$ 4,99', null],
    'Ori and the Will of the Wisps': ['R$ 5,99', null],
    'Outlast': ['R$ 4,99', 'R$ 10,99'],
    'Outlast 2': ['R$ 4,99', null],
    'Outward': ['R$ 5,99', 'R$ 12,99'],
    'Oxygen Not Included': ['R$ 4,99', 'R$ 10,99'],
    'PEAK': ['R$ 4,99', null],
    'Pacific Drive': ['R$ 5,99', null],
    'Palworld': ['R$ 6,99', null],
    'Path of Exile': ['R$ 3,99', null],
    'Pathfinder: Kingmaker': ['R$ 5,99', 'R$ 12,99'],
    'Pathfinder: Wrath of the Righteous': ['R$ 6,99', 'R$ 14,99'],
    'Persona 3 Reload': ['R$ 8,99', 'R$ 17,99'],
    'Persona 4 Golden': ['R$ 4,99', null],
    'Persona 5 Royal': ['R$ 7,99', null],
    'Pillars of Eternity': ['R$ 5,99', 'R$ 12,99'],
    'Pillars of Eternity II: Deadfire': ['R$ 6,99', 'R$ 14,99'],
    'Portal': ['R$ 3,99', null],
    'Portal 2': ['R$ 3,99', null],
    'Postal 2': ['R$ 3,99', 'R$ 6,99'],
    'Postal: Brain Damaged': ['R$ 4,99', 'R$ 10,99'],
    'PowerWash Simulator': ['R$ 4,99', 'R$ 10,99'],
    'Pragmata': ['R$ 7,99', null],
    'Prison Architect': ['R$ 4,99', 'R$ 10,99'],
    'Prodeus': ['R$ 4,99', 'R$ 10,99'],
    'Project CARS': ['R$ 5,99', 'R$ 12,99'],
    'Project Zomboid': ['R$ 4,99', null],
    'Prototype': ['R$ 4,99', null],
    'Prototype 2': ['R$ 4,99', 'R$ 10,99'],
    'Quake': ['R$ 3,99', 'R$ 5,99'],
    'Quake 4': ['R$ 3,99', null],
    'Quake II': ['R$ 3,99', 'R$ 5,99'],
    'Quantum Break': ['R$ 6,99', null],
    'R.E.P.O.': ['R$ 4,99', null],
    'RaceRoom Racing Experience Premium': ['R$ 5,99', 'R$ 12,99'],
    'Raft': ['R$ 4,99', null],
    'Rage 2': ['R$ 5,99', 'R$ 9,99'],
    'Railway Empire 2': ['R$ 6,99', 'R$ 9,99'],
    'Ratchet & Clank: Rift Apart': ['R$ 7,99', null],
    'Ravenswatch': ['R$ 5,99', 'R$ 9,99'],
    'Ravenswatch: Nightmares Unleashed': ['R$ 5,99', 'R$ 9,99'],
    'Ready or Not': ['R$ 6,99', 'R$ 9,99'],
    'Red Dead Redemption 2': ['R$ 25,00', null],
    'Resident Evil': ['R$ 4,99', null],
    'Resident Evil 0': ['R$ 4,99', null],
    'Resident Evil 2 Remake': ['R$ 15,99', null],
    'Resident Evil 3 Remake': ['R$ 15,99', null],
    'Resident Evil 4 (2007)': ['R$ 4,99', 'R$ 10,99'],
    'Resident Evil 4 Remake': ['R$ 27,99', 'R$ 29,99'],
    'Resident Evil 7': ['R$ 12,99', 'R$ 17,99'],
    'Resident Evil Requiem': ['R$ 34,00', null],
    'Resident Evil Village': ['R$ 12,99', 'R$ 17,99'],
    'Return of the Obra Dinn': ['R$ 4,99', null],
    'Return to Castle Wolfenstein': ['R$ 3,99', null],
    'Returnal': ['R$ 7,99', null],
    'RimWorld': ['R$ 5,99', 'R$ 12,99'],
    'Rise of the Tomb Raider': ['R$ 5,99', 'R$ 12,99'],
    'Risen': ['R$ 3,99', null],
    'Rogue Legacy': ['R$ 4,99', null],
    'Rogue Legacy 2': ['R$ 6,99', null],
    'Ryse: Son of Rome': ['R$ 5,99', null],
    'S.T.A.L.K.E.R. 2': ['R$ 8,99', 'R$ 10,00'],
    'S.T.A.L.K.E.R. Call of Pripyat': ['R$ 4,99', null],
    'S.T.A.L.K.E.R. Clear Sky': ['R$ 4,99', null],
    'S.T.A.L.K.E.R. Shadow of Chernobyl': ['R$ 4,99', null],
    'SOMA': ['R$ 5,99', null],
    'Sackboy: A Big Adventure': ['R$ 7,99', null],
    'Sacred 2 Gold': ['R$ 5,99', 'R$ 11,99'],
    'Sacred 3': ['R$ 5,99', 'R$ 11,99'],
    'Saints Row 2': ['R$ 3,99', null],
    'Saints Row IV': ['R$ 5,99', 'R$ 11,99'],
    'Saints Row: The Third Remastered': ['R$ 6,99', 'R$ 13,99'],
    'Satisfactory': ['R$ 7,99', null],
    'Sea of Thieves': ['R$ 7,99', 'R$ 10,00'],
    'Sekiro: Shadows Die Twice': ['R$ 8,99', null],
    'Selaco': ['R$ 5,99', null],
    'Serious Sam 2': ['R$ 3,99', null],
    'Serious Sam 3: BFE': ['R$ 4,99', 'R$ 9,99'],
    'Serious Sam 4': ['R$ 6,99', 'R$ 13,99'],
    'Serious Sam HD: The First Encounter': ['R$ 4,99', null],
    'Shadow Gambit: The Cursed Crew': ['R$ 6,99', null],
    'Shadow of the Tomb Raider': ['R$ 7,99', 'R$ 15,99'],
    'Shadows of Doubt': ['R$ 5,99', null],
    'Shovel Knight: Treasure Trove': ['R$ 5,99', null],
    'Signalis': ['R$ 5,99', null],
    'Silent Hill 2 (Remake)': ['R$ 12,99', null],
    'Singularity': ['R$ 4,99', null],
    'Skyrim Anniversary Edition': ['R$ 8,99', 'R$ 12,99'],
    'Skyrim Special Edition': ['R$ 7,99', 'R$ 9,99'],
    'Slay the Spire': ['R$ 4,99', null],
    'Slay the Spire II': ['R$ 6,99', null],
    'Sleeping Dogs Definitive Edition': ['R$ 5,99', 'R$ 9,99'],
    'SnowRunner': ['R$ 6,99', 'R$ 9,99'],
    'Solasta II': ['R$ 6,99', null],
    'Solasta: Crown of the Magister': ['R$ 6,99', 'R$ 9,99'],
    'Soldier of Fortune': ['R$ 3,99', null],
    'Soldier of Fortune II': ['R$ 3,99', null],
    'Song of Horror': ['R$ 5,99', null],
    'Songs of Conquest': ['R$ 6,99', 'R$ 9,99'],
    'Sons of Valhalla': ['R$ 5,99', null],
    'Sons of the Forest': ['R$ 7,99', null],
    'Soulcalibur VI': ['R$ 7,99', 'R$ 9,99'],
    'Soulmask': ['R$ 6,99', null],
    'Spec Ops: The Line': ['R$ 4,99', null],
    'Squad': ['R$ 7,99', 'R$ 15,99'],
    'Star Ocean: The Second Story R': ['R$ 7,99', null],
    'Stardew Valley': ['R$ 10,00', null],
    'Starfield': ['R$ 19,99', 'R$ 22,99'],
    'State of Decay': ['R$ 4,99', 'R$ 9,99'],
    'State of Decay 2': ['R$ 6,99', 'R$ 13,99'],
    'Stellaris': ['R$ 7,99', 'R$ 15,99'],
    'Still Wakes the Deep': ['R$ 6,99', 'R$ 13,99'],
    'Street Fighter 6': ['R$ 12,99', 'R$ 16,99'],
    'Street Fighter V': ['R$ 12,99', 'R$ 16,99'],
    'Stronghold Crusader 2': ['R$ 5,99', 'R$ 11,99'],
    'Stronghold Crusader HD': ['R$ 3,99', null],
    'Stronghold Definitive Edition': ['R$ 5,99', null],
    'Subnautica': ['R$ 8,99', null],
    'Subnautica 2': ['R$ 11,99', null],
    'Subnautica: Below Zero': ['R$ 16,99', null],
    'Sunset Overdrive': ['R$ 4,99', null],
    'Supermarket Simulator': ['R$ 4,99', null],
    'System Shock (Remake)': ['R$ 6,99', null],
    'Tales of Arise': ['R$ 7,99', 'R$ 15,99'],
    'Tales of Vesperia': ['R$ 5,99', 'R$ 11,99'],
    'Tekken 7': ['R$ 9,99', 'R$ 12,99'],
    'Tekken 8': ['R$ 14,99', 'R$ 17,99'],
    'Terminator: Resistance': ['R$ 6,99', 'R$ 13,99'],
    'Terraria': ['R$ 6,99', null],
    'Test Drive Unlimited': ['R$ 4,99', null],
    'Test Drive Unlimited 2': ['R$ 5,99', 'R$ 9,99'],
    'The Beast Inside': ['R$ 4,99', null],
    'The Binding of Isaac: Rebirth': ['R$ 5,99', 'R$ 11,99'],
    'The Elder Scrolls III: Morrowind': ['R$ 4,99', 'R$ 9,99'],
    'The Elder Scrolls IV: Oblivion': ['R$ 4,99', 'R$ 9,99'],
    'The Elder Scrolls IV: Oblivion Remastered': ['R$ 6,99', null],
    'The Evil Within 2': ['R$ 6,99', null],
    'The Forest': ['R$ 4,99', null],
    'The Last of Us Part I': ['R$ 8,99', null],
    'The Messenger': ['R$ 4,99', null],
    'The Outer Worlds': ['R$ 7,99', 'R$ 15,99'],
    'The Saboteur': ['R$ 4,99', null],
    'The Surge': ['R$ 5,99', 'R$ 11,99'],
    'The Surge 2': ['R$ 6,99', 'R$ 13,99'],
    'The Talos Principle 2': ['R$ 6,99', 'R$ 13,99'],
    'The Witcher 3: Wild Hunt': ['R$ 9,99', 'R$ 13,99'],
    'Titanfall 2': ['R$ 5,99', null],
    'Tomb Raider (2013)': ['R$ 4,99', 'R$ 6,99'],
    'Tomb Raider: Anniversary': ['R$ 4,99', null],
    'Tomb Raider: Legend': ['R$ 5,99', null],
    'Tomb Raider: Underworld': ['R$ 5,99', 'R$ 9,99'],
    'Tormented Souls': ['R$ 5,99', null],
    'Total War: Rome II': ['R$ 7,99', 'R$ 10,99'],
    'Total War: Warhammer': ['R$ 7,99', 'R$ 10,99'],
    'Total War: Warhammer II': ['R$ 8,99', 'R$ 10,99'],
    'Total War: Warhammer III': ['R$ 9,99', 'R$ 10,99'],
    'Trepang2': ['R$ 6,99', 'R$ 13,99'],
    'Triangle Strategy': ['R$ 6,99', null],
    'Tropico 5': ['R$ 5,99', 'R$ 11,99'],
    'Tropico 6': ['R$ 6,99', 'R$ 13,99'],
    'Turbo Overkill': ['R$ 5,99', null],
    'Two Worlds II': ['R$ 4,99', 'R$ 9,99'],
    'Tyranny': ['R$ 6,99', 'R$ 8,99'],
    'Uncharted: Legacy of Thieves Collection': ['R$ 7,99', null],
    'Undertale': ['R$ 3,99', null],
    'Unreal Gold': ['R$ 3,99', null],
    'Unreal Tournament 3': ['R$ 4,99', 'R$ 9,99'],
    'Until Dawn': ['R$ 7,99', null],
    'V Rising': ['R$ 6,99', 'R$ 13,99'],
    'Valheim': ['R$ 7,99', null],
    'Vampire Survivors': ['R$ 4,99', 'R$ 9,99'],
    'Vampire: The Masquerade': ['R$ 4,99', null],
    'Victoria 3': ['R$ 7,99', 'R$ 15,99'],
    'Visage': ['R$ 5,99', null],
    'Voidtrain': ['R$ 5,99', null],
    'Warhammer 40,000: Darktide': ['R$ 6,99', 'R$ 10,99'],
    'Warhammer 40,000: Rogue Trader': ['R$ 7,99', 'R$ 10,99'],
    'Warhammer 40,000: Space Marine 2': ['R$ 8,99', 'R$ 10,99'],
    'Wartales': ['R$ 6,99', 'R$ 10,99'],
    'Wartales: The Skelmar Invasion': ['R$ 5,99', 'R$ 9,99'],
    'Wasteland 2': ['R$ 5,99', 'R$ 9,99'],
    'Wasteland 3': ['R$ 6,99', 'R$ 9,99'],
    'Watch Dogs': ['R$ 5,99', 'R$ 9,99'],
    'Watch Dogs 2': ['R$ 6,99', 'R$ 10,99'],
    'Wolfenstein II: The New Colossus': ['R$ 6,99', 'R$ 9,99'],
    'Wolfenstein: The New Order': ['R$ 5,99', null],
    'Wolfenstein: The Old Blood': ['R$ 4,99', null],
    'Workers & Resources: Soviet Republic': ['R$ 6,99', 'R$ 9,99'],
    'Wreckfest': ['R$ 5,99', 'R$ 9,99'],
    'XCOM 2': ['R$ 6,99', 'R$ 9,99'],
    'Ys IX': ['R$ 6,99', 'R$ 9,99'],
  };

  const [basePrice, dlcPrice] = PRICE_MAP[title] ?? [
    `R$ ${(29 + (Math.abs(appId) % 17) * 10 + 0.9).toFixed(2).replace('.', ',')}`,
    hasDLC ? `R$ ${(29 + (Math.abs(appId) % 17) * 10 + 0.9 + 60).toFixed(2).replace('.', ',')}` : null
  ];

  const variants: GameVariant[] | undefined = (hasDLC && dlcPrice)
    ? [
        { label: 'Edição Base', price: basePrice, stock: 5 + (appId % 8) },
        { label: 'Edição Completa (Base + DLCs)', price: dlcPrice, stock: 2 + (appId % 5) }
      ]
    : undefined;

  return {
    id: baseId,
    appId,
    title,
    price: basePrice,
    category: cat,
    reviewScore: 'Muito Positivo',
    players: 'Single / Multiplayer',
    description: `${title} — disponível na Neplim Store com Steam Key e entrega imediata por e-mail.`,
    developer: '—',
    publisher: '—',
    releaseDate: '—',
    genres: [cat],
    minReq: DEFAULT_MIN_REQ,
    recReq: DEFAULT_REC_REQ,
    variants
  };
}

const EXTRA_GAMES: Game[] = GAME_SEEDS.map((s, i) => expandSeed(s, 1000 + i));
const ALL_GAMES: Game[] = [...GAMES, ...EXTRA_GAMES];

// Placeholder cover used when a game has no valid Steam AppID (N/A / not on Steam).
const COVER_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1A0035"/>
          <stop offset="100%" stop-color="#7B2FBE"/>
        </linearGradient>
      </defs>
      <rect width="600" height="900" fill="url(#g)"/>
      <text x="50%" y="48%" text-anchor="middle" fill="#E0AAFF"
            font-family="Segoe UI, Arial, sans-serif" font-size="48" font-weight="700">Sem capa</text>
      <text x="50%" y="56%" text-anchor="middle" fill="#C77DFF"
            font-family="Segoe UI, Arial, sans-serif" font-size="24">Indisponivel na Steam</text>
    </svg>`
  );

// Manual overrides for games whose Steam library_600x900.jpg is unavailable
// at the standard CDN path (newer titles use hashed asset URLs).
const COVER_OVERRIDES: Record<number, string> = {
  // Resident Evil Requiem
  3764200: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3764200/ce5437442768e38eb575f205ab9397d0264017b0/header.jpg',
  // Escape from Tarkov
  3932890: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3932890/e6bcff9e3787f9fc19e46dc06c12c841cf3d4cb7/header_alt_assets_0.jpg',
  // The Elder Scrolls IV: Oblivion Remastered (library_600x900 indisponível no CDN padrão)
  2623190: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2623190/67e60b0125feb2f0cc6964f0acb785faf1207fbd/capsule_616x353.jpg',
  // Grounded 2
  2661300: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2661300/a9f02144893a4bad56c7333c068e9ae2e28da52d/capsule_616x353.jpg',
  // 33 Immortals
  958520: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/958520/6a481853b8b2effa7639abdd856b7f7af32b7358/capsule_616x353.jpg',
};

const coverImg = (appId: number) => {
  if (appId <= 0) return COVER_PLACEHOLDER;
  if (COVER_OVERRIDES[appId]) return COVER_OVERRIDES[appId];
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`;
};

function useGlobalStyles() {
  useEffect(() => {
    const el = document.createElement('style');
    el.innerHTML = `
      *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
      html { scroll-behavior:smooth; }
      body { background:#000000; color:${C.text}; font-family:'Segoe UI',system-ui,sans-serif; overflow-x:hidden; }
      ::-webkit-scrollbar { width:6px; }
      ::-webkit-scrollbar-track { background:#050505; }
      ::-webkit-scrollbar-thumb { background:linear-gradient(180deg,${C.primary},${C.secondary}); border-radius:3px; }
      ::-webkit-scrollbar-thumb:hover { background:${C.secondary}; }
      input, button, textarea, select { font-family:inherit; }
      img { display:block; }

      /* ── GAME CARDS ── */
      .game-card { transition:transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease; cursor:pointer; position:relative; }
      .game-card::before { content:''; position:absolute; inset:0; border-radius:14px; background:linear-gradient(135deg,rgba(123,47,190,0.15),transparent); opacity:0; transition:opacity 0.3s; z-index:1; pointer-events:none; }
      .game-card:hover { transform:translateY(-10px) scale(1.03); box-shadow:0 30px 60px rgba(0,0,0,0.9), 0 0 40px rgba(123,47,190,0.6), 0 0 80px rgba(123,47,190,0.25), inset 0 0 0 1px rgba(199,125,255,0.3); }
      .game-card:hover::before { opacity:1; }
      .game-card:hover .card-img { filter:brightness(1.12) saturate(1.2); transform:scale(1.04); }
      .card-img { transition:filter 0.3s ease, transform 0.3s ease; }

      /* ── BUTTONS ── */
      .btn-glow { transition:background 0.2s, box-shadow 0.3s, transform 0.15s; position:relative; overflow:hidden; }
      .btn-glow::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.15),transparent); opacity:0; transition:opacity 0.2s; }
      .btn-glow:hover { box-shadow:0 0 35px rgba(123,47,190,0.9), 0 0 70px rgba(123,47,190,0.45) !important; transform:translateY(-2px); }
      .btn-glow:hover::after { opacity:1; }
      .btn-glow:active { transform:scale(0.96) translateY(0); }

      /* ── NAVIGATION ── */
      .nav-link { position:relative; transition:color 0.2s; }
      .nav-link::after { content:''; position:absolute; bottom:-4px; left:0; width:0; height:2px; background:linear-gradient(90deg,${C.primary},${C.secondary}); transition:width 0.3s ease; border-radius:2px; }
      .nav-link:hover { color:${C.secondary} !important; }
      .nav-link:hover::after { width:100%; }

      /* ── CATEGORY PILLS ── */
      .cat-pill { transition:all 0.25s cubic-bezier(.34,1.56,.64,1); cursor:pointer; }
      .cat-pill:hover { border-color:${C.primary} !important; color:white !important; transform:translateY(-2px) scale(1.05); box-shadow:0 6px 20px rgba(123,47,190,0.4); }

      /* ── ACC CARDS ── */
      .acc-card { transition:transform 0.3s cubic-bezier(.34,1.56,.64,1), border-color 0.3s ease, box-shadow 0.3s ease; cursor:pointer; }
      .acc-card:hover { transform:translateY(-7px) scale(1.02); border-color:rgba(199,125,255,0.6) !important; box-shadow:0 20px 40px rgba(0,0,0,0.6), 0 0 30px rgba(123,47,190,0.3); }

      /* ── MISC ── */
      .thumb:hover { opacity:1 !important; border-color:${C.secondary} !important; transform:scale(1.05); transition:all 0.2s; }
      .variant-radio:hover { border-color:rgba(199,125,255,0.7) !important; background:rgba(123,47,190,0.1) !important; transform:scale(1.02); }
      .buy-btn-main:hover { background:#e8e8e8 !important; transform:translateY(-1px); box-shadow:0 8px 25px rgba(255,255,255,0.15) !important; }
      .cart-btn:hover { background:rgba(123,47,190,0.2) !important; border-color:rgba(199,125,255,0.6) !important; transform:translateY(-1px); }
      .adm-btn-edit:hover { color:${C.accent} !important; text-shadow:0 0 10px rgba(199,125,255,0.6); }
      .adm-btn-del:hover { text-shadow:0 0 10px rgba(255,107,107,0.6); }
      .adm-row { transition:background 0.2s; }
      .adm-row:hover { background:rgba(123,47,190,0.07) !important; }

      /* ── KEYFRAMES ── */
      @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      @keyframes fadeInDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
      @keyframes gameFadeIn { from{transform:translateY(28px) scale(0.97);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
      @keyframes slideUp { from{transform:translateY(40px) scale(0.97);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
      @keyframes slideInLeft { from{transform:translateX(-30px);opacity:0} to{transform:translateX(0);opacity:1} }
      @keyframes slideInRight { from{transform:translateX(30px);opacity:0} to{transform:translateX(0);opacity:1} }
      @keyframes heroBg { from{opacity:0;transform:scale(1.1)} to{opacity:1;transform:scale(1.05)} }
      @keyframes purplePulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
      @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
      @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
      @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      @keyframes glowPulse { 0%,100%{box-shadow:0 0 20px rgba(123,47,190,0.4)} 50%{box-shadow:0 0 50px rgba(123,47,190,0.9),0 0 90px rgba(123,47,190,0.4)} }
      @keyframes borderGlow { 0%,100%{border-color:rgba(123,47,190,0.3)} 50%{border-color:rgba(199,125,255,0.7)} }
      @keyframes particleFloat { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(-120px) rotate(360deg);opacity:0} }
      @keyframes ripple { 0%{transform:scale(0);opacity:0.6} 100%{transform:scale(4);opacity:0} }
      @keyframes adminFadeIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      @keyframes adminSlideIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
      @keyframes countUp { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }
      @keyframes neonFlicker { 0%,19%,21%,23%,25%,54%,56%,100%{text-shadow:0 0 10px ${C.secondary},0 0 20px ${C.secondary},0 0 40px ${C.primary}} 20%,24%,55%{text-shadow:none} }
      @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
      @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
      @keyframes popIn { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
      @keyframes heartbeat { 0%,100%{transform:scale(1)} 14%{transform:scale(1.1)} 28%{transform:scale(1)} 42%{transform:scale(1.08)} 70%{transform:scale(1)} }

      /* ── APPLIED ANIMATIONS ── */
      .modal-overlay { animation:fadeIn 0.25s ease; }
      .modal-box { animation:slideUp 0.35s cubic-bezier(.34,1.56,.64,1); }
      .hero-slide-anim { animation:fadeIn 0.6s ease; }
      .hero-bg { animation:heroBg 1s ease forwards; }
      .purple-orb { animation:purplePulse 4s ease-in-out infinite; }
      .float-badge { animation:floatUp 3s ease-in-out infinite; }
      .glow-card { animation:glowPulse 3s ease-in-out infinite; }
      .border-glow { animation:borderGlow 2.5s ease-in-out infinite; }
      .checkout-modal { animation:slideUp 0.4s cubic-bezier(.34,1.56,.64,1); }
      .key-reveal { animation:popIn 0.5s cubic-bezier(.34,1.56,.64,1); }
      .stat-num { animation:countUp 0.6s cubic-bezier(.34,1.56,.64,1) both; }
      .pop-in { animation:popIn 0.4s cubic-bezier(.34,1.56,.64,1); }

      /* ── SHIMMER SKELETON ── */
      .shimmer { background:linear-gradient(90deg,rgba(255,255,255,0.03) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.03) 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; }

      /* ── NEON TEXT ── */
      .neon-text { animation:neonFlicker 5s infinite; }

      /* ── GRADIENT ANIMATED BG ── */
      .gradient-animated { background:linear-gradient(270deg,${C.primary},${C.secondary},#8b5cf6,${C.primary}); background-size:400% 400%; animation:gradientShift 6s ease infinite; }

      /* ── RIPPLE EFFECT ── */
      .ripple-btn { position:relative; overflow:hidden; }
      .ripple-btn::after { content:''; position:absolute; width:20px; height:20px; background:rgba(255,255,255,0.4); border-radius:50%; transform:scale(0); top:50%; left:50%; margin:-10px; animation:ripple 0.6s ease-out; }
      .ripple-btn:active::after { animation:ripple 0.6s ease-out; }

      /* ── SCROLLBAR CUSTOM ── */
      * { scrollbar-width:thin; scrollbar-color:${C.primary} #050505; }
    `;
    document.head.appendChild(el);
    return () => { document.head.removeChild(el); };
  }, []);
}

/* ═══════════════════════════════════════════════════════════
   HEADER
═══════════════════════════════════════════════════════════ */
interface HeaderProps {
  onLoginClick: () => void;
  isLoggedIn: boolean;
  username: string;
  onLogout: () => void;
  searchQuery: string;
  onSearch: (q: string) => void;
  onMinhasCompras: () => void;
  onConfiguracoes: () => void;
  onCartClick: () => void;
  cartCount: number;
}

function Header({ onLoginClick, isLoggedIn, username, onLogout, searchQuery, onSearch, onMinhasCompras, onConfiguracoes, onCartClick, cartCount }: HeaderProps) {
  const [userMenu, setUserMenu] = useState(false);

  return (
    <header style={{ position:'sticky', top:0, zIndex:200, background:'#0a0a0f', borderBottom:`1px solid ${C.border}` }}>
      <div style={{ maxWidth:1400, margin:'0 auto', padding:'0 24px', height:64, display:'flex', alignItems:'center', gap:18 }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:9, flexShrink:0, cursor:'pointer' }}>
          <div style={{ width:34, height:34, borderRadius:'50%', background:`linear-gradient(135deg,${C.primary},${C.secondary})`, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="11" width="4" height="2" rx="1"/><path d="M8 11V8M15 13h2M17 11h2"/><circle cx="12" cy="12" r="10"/></svg>
          </div>
          <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:16, fontWeight:800, color:'#fff', letterSpacing:'0.2px', whiteSpace:'nowrap' }}>
            NEPLIM STORE
            <BadgeCheck size={16} color={C.secondary} fill={C.primary} strokeWidth={2} />
          </span>
        </div>

        {/* Busca */}
        <div style={{ flex:1, maxWidth:520, position:'relative', margin:'0 auto' }}>
          <span style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'#6b6b78', pointerEvents:'none', display:'flex' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <input type="text" placeholder="Procure pelo nome do produto" value={searchQuery} onChange={e => onSearch(e.target.value)}
            style={{ width:'100%', padding:'10px 16px 10px 42px', background:'#15151d', border:'1px solid rgba(255,255,255,0.06)', borderRadius:999, color:'#e8e8ec', fontSize:14, outline:'none', transition:'border-color 0.2s, box-shadow 0.2s' }}
            onFocus={e => { e.target.style.borderColor = C.secondary; e.target.style.boxShadow = `0 0 0 2px ${C.glow}`; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Ações à direita */}
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          {isLoggedIn ? (
            <div style={{ position:'relative' }}>
              <button onClick={() => setUserMenu(!userMenu)}
                style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 16px', borderRadius:10, background:'transparent', border:'none', color:'#e8e8ec', fontSize:14, fontWeight:600, cursor:'pointer' }}>
                <Users size={16} />
                {username}
                <ChevronDown size={12} color="#9b9ba8" />
              </button>
              {userMenu && (
                <div style={{ position:'absolute', top:'115%', right:0, minWidth:170, background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden', zIndex:300, boxShadow:`0 8px 30px rgba(0,0,0,0.4)` }}>
                  {[['Meu Perfil'],['Minhas Compras'],['Configurações']].map(([lb])=>(
                    <button key={lb} onClick={()=>{ setUserMenu(false); if (lb === 'Minhas Compras') onMinhasCompras(); if (lb === 'Configurações') onConfiguracoes(); }} style={{ width:'100%', padding:'11px 16px', background:'none', border:'none', color:C.text, textAlign:'left', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', gap:8, transition:'background 0.15s' }}
                      onMouseEnter={e=>(e.currentTarget.style.background=C.surface)} onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                      {lb}
                    </button>
                  ))}
                  <div style={{ height:1, background:C.border, margin:'4px 0' }} />
                  <button onClick={()=>{onLogout();setUserMenu(false);}} style={{ width:'100%', padding:'11px 16px', background:'none', border:'none', color:'#FF6B6B', textAlign:'left', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', gap:8 }}>
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={onLoginClick}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 16px', borderRadius:10, background:'transparent', border:'none', color:'#e8e8ec', fontWeight:600, fontSize:14, cursor:'pointer' }}>
              <Users size={16} />
              Entrar
            </button>
          )}

          <button className="cart-btn" onClick={onCartClick}
            style={{ position:'relative', display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:10, background:C.primary, border:'none', color:'white', fontWeight:700, fontSize:14, cursor:'pointer', boxShadow:`0 0 18px ${C.glow}` }}>
            <ShoppingCart size={16} />
            Carrinho
            {cartCount > 0 && (
              <span style={{ position:'absolute', top:-6, right:-6, minWidth:20, height:20, padding:'0 5px', borderRadius:10, background:'#FF4655', color:'#fff', fontSize:11, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #0a0a0f' }}>
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════
   LOGIN MODAL
═══════════════════════════════════════════════════════════ */
function LoginModal({ onClose, onLogin, onAdminLogin }: { onClose: () => void; onLogin: (user: string, email: string, token: string) => void; onAdminLogin: (token: string) => void }) {
  const [isReg, setIsReg] = useState(false);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!email || !pass) { setErr('Preencha todos os campos.'); return; }
    if (pass.length < 6) { setErr('Senha deve ter ao menos 6 caracteres.'); return; }
    if (isReg && !name) { setErr('Informe um nome de usuário.'); return; }

    setLoading(true);
    try {
      // Só tenta login de admin na aba de "Entrar" (nunca no cadastro), usando
      // o mesmo campo de e-mail/usuário e senha. Se as credenciais não forem
      // do admin, o backend recusa e seguimos no fluxo normal de cliente —
      // sem nenhuma pista visível de que essa tentativa aconteceu.
      if (!isReg) {
        try {
          const adminRes = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: email, senha: pass })
          });
          if (adminRes.ok) {
            const adminData = await adminRes.json();
            onAdminLogin(adminData.token);
            setLoading(false);
            return;
          }
        } catch {
          // Backend de admin indisponível ou erro de rede: ignora e segue pro login de cliente.
        }
      }

      if (isReg) {
        const res = await fetch(`${API_BASE}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: name, email, senha: pass })
        });
        const data = await res.json();
        if (!res.ok) { setErr(data.erro || 'Erro ao cadastrar.'); setLoading(false); return; }
      }

      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: pass })
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.erro || 'Erro ao entrar.'); setLoading(false); return; }

      onLogin(data.usuario.nome, data.usuario.email, data.token);
    } catch (error) {
      setErr('Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}
      style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}
        style={{ width:'100%', maxWidth:420, background:C.card, border:`1px solid ${C.border}`, borderRadius:24, padding:36, position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:16, right:16, background:'none', border:'none', color:C.textMuted, fontSize:22, cursor:'pointer' }}>
          <X size={20} />
        </button>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:`linear-gradient(135deg,${C.primary},${C.secondary})`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="11" width="4" height="2" rx="1"/><path d="M8 11V8M15 13h2M17 11h2"/><circle cx="12" cy="12" r="10"/></svg>
          </div>
          <h2 style={{ fontSize:26, fontWeight:900, color:C.textLight }}>{isReg?'Criar Conta':'Entrar na Neplim'}</h2>
          <p style={{ color:C.textMuted, fontSize:14, marginTop:4 }}>{isReg?'Crie sua conta e comece a jogar':'Bem-vindo de volta!'}</p>
        </div>
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {isReg && <input type="text" placeholder="Nome de usuário" value={name} onChange={e=>setName(e.target.value)} style={{ padding:'12px 16px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:15, outline:'none', width:'100%' }} />}
          <input type="text" placeholder="E-mail" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} style={{ padding:'12px 16px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:15, outline:'none', width:'100%' }} />
          <input type="password" placeholder="Senha" value={pass} onChange={e=>setPass(e.target.value)} style={{ padding:'12px 16px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:15, outline:'none', width:'100%' }} />
          {err && <p style={{ color:'#FF6B6B', fontSize:13 }}>{err}</p>}
          <button type="submit" disabled={loading} className="btn-glow" style={{ padding:'13px', borderRadius:10, background:C.primary, border:'none', color:'white', fontWeight:700, fontSize:16, cursor:loading?'default':'pointer', marginTop:4, opacity:loading?0.7:1 }}>
            {loading ? 'Aguarde...' : (isReg ? 'Criar Conta' : 'Entrar')}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:20, color:C.textMuted, fontSize:14 }}>
          {isReg?'Já tem conta? ':'Não tem conta? '}
          <button onClick={()=>{setIsReg(!isReg);setErr('');}} style={{ background:'none', border:'none', color:C.secondary, cursor:'pointer', fontWeight:700, fontSize:14 }}>
            {isReg?'Entrar':'Cadastre-se grátis'}
          </button>
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CONFIGURAÇÕES (SETTINGS MODAL)
═══════════════════════════════════════════════════════════ */
function SettingsModal({ token, username, accountEmail, onClose, onLogout }: {
  token: string;
  username: string;
  accountEmail: string;
  onClose: () => void;
  onLogout: () => void;
}) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setMsg('');

    if (!senhaAtual || !novaSenha || !confirmaSenha) { setErr('Preencha todos os campos.'); return; }
    if (novaSenha.length < 6) { setErr('A nova senha deve ter ao menos 6 caracteres.'); return; }
    if (novaSenha !== confirmaSenha) { setErr('As senhas novas não conferem.'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/alterar-senha`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ senhaAtual, novaSenha })
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.erro || 'Erro ao alterar senha.'); setLoading(false); return; }

      setMsg('Senha alterada com sucesso!');
      setSenhaAtual(''); setNovaSenha(''); setConfirmaSenha('');
    } catch (error) {
      setErr('Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}
      style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}
        style={{ width:'100%', maxWidth:420, background:C.card, border:`1px solid ${C.border}`, borderRadius:24, padding:36, position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:16, right:16, background:'none', border:'none', color:C.textMuted, fontSize:22, cursor:'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ textAlign:'center', marginBottom:24 }}>
          <h2 style={{ fontSize:24, fontWeight:900, color:C.textLight }}>Configurações</h2>
          <p style={{ color:C.textMuted, fontSize:14, marginTop:4 }}>Gerencie sua conta</p>
        </div>

        {/* Dados da conta (somente leitura) */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:16, marginBottom:24 }}>
          <p style={{ color:C.textMuted, fontSize:12, marginBottom:2 }}>Nome de usuário</p>
          <p style={{ color:C.textLight, fontSize:15, fontWeight:600, marginBottom:10 }}>{username}</p>
          <p style={{ color:C.textMuted, fontSize:12, marginBottom:2 }}>E-mail</p>
          <p style={{ color:C.textLight, fontSize:15, fontWeight:600 }}>{accountEmail}</p>
        </div>

        {/* Troca de senha */}
        <p style={{ color:C.text, fontSize:14, fontWeight:700, marginBottom:10 }}>Alterar senha</p>
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <input type="password" placeholder="Senha atual" value={senhaAtual} onChange={e=>setSenhaAtual(e.target.value)}
            style={{ padding:'12px 16px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:15, outline:'none', width:'100%' }} />
          <input type="password" placeholder="Nova senha" value={novaSenha} onChange={e=>setNovaSenha(e.target.value)}
            style={{ padding:'12px 16px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:15, outline:'none', width:'100%' }} />
          <input type="password" placeholder="Confirmar nova senha" value={confirmaSenha} onChange={e=>setConfirmaSenha(e.target.value)}
            style={{ padding:'12px 16px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:15, outline:'none', width:'100%' }} />
          {err && <p style={{ color:'#FF6B6B', fontSize:13 }}>{err}</p>}
          {msg && <p style={{ color:C.green, fontSize:13 }}>{msg}</p>}
          <button type="submit" disabled={loading} className="btn-glow"
            style={{ padding:'13px', borderRadius:10, background:C.primary, border:'none', color:'white', fontWeight:700, fontSize:16, cursor:loading?'default':'pointer', marginTop:4, opacity:loading?0.7:1 }}>
            {loading ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>

        <div style={{ height:1, background:C.border, margin:'24px 0' }} />

        <button onClick={() => { onLogout(); onClose(); }}
          style={{ width:'100%', padding:'12px', borderRadius:10, background:'none', border:'1px solid rgba(255,107,107,0.4)', color:'#FF6B6B', fontWeight:700, fontSize:14, cursor:'pointer' }}>
          Sair da conta
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO SLIDER
═══════════════════════════════════════════════════════════ */
const CLIP_DURATION = 30;

function HeroSlider({ onBuy }: { onBuy: (g: FeaturedGame) => void }) {
  const [active, setActive] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setPaused(false); setElapsed(0);
    const tick = setInterval(() => {
      setElapsed(prev => {
        if (prev + 1 >= CLIP_DURATION) { clearInterval(tick); setPaused(true); return CLIP_DURATION; }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [active, iframeKey]);

  useEffect(() => {
    if (!paused) return;
    const t = setTimeout(() => { setActive(a => (a + 1) % FEATURED.length); setIframeKey(k => k + 1); }, 2000);
    return () => clearTimeout(t);
  }, [paused]);

  const g = FEATURED[active];
  const switchSlide = (i: number) => { setActive(i); setIframeKey(k => k + 1); };
  const replayCurrent = () => { setIframeKey(k => k + 1); };

  return (
    <section style={{ position:'relative', background:'#000000', overflow:'hidden' }}>
      <div key={active} className="hero-slide-anim" style={{ position:'absolute', inset:0, zIndex:0 }}>
        <img src={g.cover} alt="" className="hero-bg" style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.22) blur(4px)', transformOrigin:'center' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(105deg, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.3) 100%)' }} />
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 15% 60%, rgba(123,47,190,0.45) 0%, transparent 50%)` }} />
      </div>

      <div style={{ position:'relative', zIndex:2, maxWidth:1400, margin:'0 auto', padding:'60px 40px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:48, flexWrap:'wrap' }}>
          <div key={active + 'info'} className="hero-slide-anim" style={{ flex:'0 0 460px', minWidth:280 }}>
            <span style={{ display:'inline-block', background:C.primary, color:'white', padding:'5px 16px', borderRadius:20, fontSize:13, fontWeight:700, marginBottom:18, boxShadow:`0 0 18px ${C.glow}` }}>{g.badge}</span>
            <h1 style={{ fontSize:48, fontWeight:900, color:'#ffffff', lineHeight:1.05, marginBottom:18, textShadow:`0 2px 30px rgba(123,47,190,0.7)` }}>{g.title}</h1>
            <p style={{ fontSize:15, color:'rgba(200,170,255,0.75)', lineHeight:1.8, marginBottom:30, maxWidth:420 }}>{g.description}</p>
            <div style={{ marginBottom:30 }}>
              <span style={{ fontSize:40, fontWeight:900, color:'#ffffff', textShadow:`0 0 30px rgba(199,125,255,0.6)` }}>{g.price}</span>
            </div>
            <button className="btn-glow" onClick={() => onBuy(g)}
              style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'15px 34px', borderRadius:14, background:`linear-gradient(135deg, ${C.primary}, #9D4EDD)`, border:'1px solid rgba(199,125,255,0.35)', color:'white', fontWeight:800, fontSize:16, cursor:'pointer', boxShadow:`0 0 30px rgba(123,47,190,0.5)` }}>
              <ShoppingCart size={18} />
              Compre Já
            </button>
          </div>

          <div style={{ flex:1, minWidth:300, display:'flex', justifyContent:'flex-end' }}>
            <div style={{ width:'100%', maxWidth:580, borderRadius:20, overflow:'hidden', boxShadow:`0 30px 80px rgba(0,0,0,0.9), 0 0 50px rgba(123,47,190,0.45)`, border:`2px solid rgba(123,47,190,0.5)`, background:'#000', aspectRatio:'16/9', position:'relative' }}>
              {!paused ? (
                <iframe key={`${active}-${iframeKey}`} src={`https://www.youtube.com/embed/${g.youtubeId}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&start=0&end=${CLIP_DURATION}`}
                  style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:'none' }} allow="autoplay; fullscreen" allowFullScreen title={`${g.title} Trailer`} />
              ) : (
                <>
                  <img src={g.cover} alt={g.title} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
                  <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14 }}>
                    <div style={{ fontSize:13, color:'rgba(255,255,255,0.75)', letterSpacing:'1px', textTransform:'uppercase' }}>Prévia encerrada</div>
                    <button onClick={replayCurrent} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 22px', borderRadius:30, background:C.primary, border:'none', color:'white', fontWeight:700, fontSize:15, cursor:'pointer' }}>
                      <RotateCcw size={16} /> Repetir prévia
                    </button>
                  </div>
                </>
              )}
              {!paused && (
                <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:'rgba(255,255,255,0.1)' }}>
                  <div style={{ height:'100%', width:`${(elapsed / CLIP_DURATION) * 100}%`, background:`linear-gradient(90deg,${C.primary},${C.secondary})`, transition:'width 0.9s linear' }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ position:'relative', zIndex:2, padding:'28px 40px 36px', display:'flex', justifyContent:'center', gap:12 }}>
        {FEATURED.map((fg, i) => (
          <div key={fg.id} className="thumb" onClick={() => switchSlide(i)}
            style={{ width:110, height:62, borderRadius:10, overflow:'hidden', cursor:'pointer', border:`2px solid ${i===active ? C.secondary : 'rgba(123,47,190,0.3)'}`, opacity:i===active?1:0.5, transition:'all 0.2s', flexShrink:0 }}>
            <img src={fg.cover} alt={fg.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
        ))}
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:60, background:'linear-gradient(to bottom, transparent, #000000)', zIndex:1, pointerEvents:'none' }} />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   ACCOUNTS
═══════════════════════════════════════════════════════════ */
function AccountsSection({ onBuy }: { onBuy: (a: AccountProduct) => void }) {
  return (
    <section style={{ maxWidth:1400, margin:'0 auto', padding:'44px 24px 0' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <h2 style={{ fontSize:22, fontWeight:800, color:C.textLight }}>Contas & Moedas</h2>
        <span style={{ background:C.primary, color:'white', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:700 }}>Entrega imediata</span>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16 }}>
        {ACCOUNTS.map(acc => (
          <div key={acc.id} className="acc-card" onClick={() => onBuy(acc)}
            style={{ background:acc.gradient, border:`1px solid rgba(123,47,190,0.2)`, borderRadius:18, padding:'22px 20px' }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:C.textLight, marginBottom:5 }}>{acc.title}</h3>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.55)', marginBottom:16, lineHeight:1.5 }}>{acc.subtitle}</p>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:19, fontWeight:900, color:acc.color }}>{acc.price}</span>
              <button className="btn-glow" onClick={e=>{e.stopPropagation();onBuy(acc);}}
                style={{ padding:'7px 14px', borderRadius:8, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', color:'white', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                Comprar
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   CATEGORIES
═══════════════════════════════════════════════════════════ */
function CategoriesSection({ selected, onSelect }: { selected: string; onSelect: (c:string)=>void }) {
  return (
    <section style={{ maxWidth:1400, margin:'0 auto', padding:'44px 24px 0' }}>
      <h2 style={{ fontSize:22, fontWeight:800, color:C.textLight, marginBottom:18 }}>Categorias</h2>
      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} className="cat-pill" onClick={() => onSelect(cat)}
            style={{ padding:'10px 20px', borderRadius:25, fontSize:14, fontWeight:600, border:`1.5px solid ${selected===cat ? C.primary : C.border}`, background:selected===cat ? C.primary : C.surface, color:selected===cat ? 'white' : C.textMuted }}>
            {cat}
          </button>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRODUTOS — busca da API (com fallback para a lista local)
   O catálogo agora é gerenciado pelo painel ADM e fica salvo no backend
   (products.json). Esse hook busca a lista atualizada da API; se a API
   estiver fora do ar (ex: backend não iniciado), cai de volta para a
   lista local ALL_GAMES, pra não deixar a loja vazia.
═══════════════════════════════════════════════════════════ */
function useProducts() {
  const [products, setProducts] = useState<Game[]>(ALL_GAMES);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/produtos`)
      .then(res => { if (!res.ok) throw new Error('Falha ao buscar produtos'); return res.json(); })
      .then((data: Game[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          setUsingFallback(false);
        } else {
          setProducts(ALL_GAMES);
          setUsingFallback(true);
        }
      })
      .catch(() => {
        setProducts(ALL_GAMES);
        setUsingFallback(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, usingFallback };
}

/* ═══════════════════════════════════════════════════════════
   GAMES GRID
═══════════════════════════════════════════════════════════ */
function GamesGrid({ category, search, onGame }: { category: string; search: string; onGame: (g: Game) => void }) {
  const PAGE_SIZE = 16;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const { products, loading, usingFallback } = useProducts();

  const list = products.filter(g => {
    const catOk = category === 'Todos' || g.category === category;
    const searchOk = !search || g.title.toLowerCase().includes(search.toLowerCase());
    return catOk && searchOk;
  });

  // Reset visible count whenever filter/search changes
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [category, search]);

  // Infinite-scroll: load +16 when sentinel becomes visible
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setVisibleCount(c => (c >= list.length ? c : c + PAGE_SIZE));
      }
    }, { rootMargin: '300px' });
    io.observe(node);
    return () => io.disconnect();
  }, [list.length, visibleCount]);

  const visible = list.slice(0, visibleCount);
  const hasMore = visibleCount < list.length;

  return (
    <section style={{ maxWidth:1400, margin:'0 auto', padding:'44px 24px 70px', position:'relative' }}>
      <div className="purple-orb" style={{ position:'absolute', top:-80, left:-100, width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(123,47,190,0.18) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />
      <div className="purple-orb" style={{ position:'absolute', bottom:-100, right:-80, width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(157,78,221,0.14) 0%, transparent 70%)', pointerEvents:'none', zIndex:0, animationDelay:'2s' }} />

      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:22 }}>
          <h2 style={{ fontSize:22, fontWeight:800, background:`linear-gradient(90deg,${C.textLight},${C.secondary},${C.textLight})`, backgroundSize:'200% auto', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', animation:'shimmer 3s linear infinite' }}>Jogos Steam</h2>
          <span style={{ background:'rgba(123,47,190,0.2)', color:C.secondary, border:`1px solid ${C.border}`, padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>{list.length} jogos</span>
          <span style={{ marginLeft:'auto', color:C.textMuted, fontSize:13 }}>Exibindo {visible.length} de {list.length}</span>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'70px 0', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:'50%', border:`3px solid ${C.border}`, borderTopColor:C.secondary, animation:'spin 0.9s linear infinite' }} />
            <span style={{ color:C.textMuted, fontSize:14 }}>Carregando catálogo…</span>
          </div>
        ) : list.length === 0 ? (
          <div style={{ textAlign:'center', padding:'70px 0', color:C.textMuted }}>
            <p style={{ fontSize:18 }}>Nenhum jogo encontrado</p>
          </div>
        ) : (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:20 }}>
              {visible.map((game, idx) => (
                <div key={game.id} className="game-card" onClick={() => onGame(game)}
                  style={{ background:'linear-gradient(180deg, #111111 0%, #0a0a0a 100%)', border:'1px solid rgba(123,47,190,0.25)', borderRadius:14, overflow:'hidden', display:'flex', flexDirection:'column', animation:`gameFadeIn 0.4s ease backwards`, animationDelay:`${(idx % PAGE_SIZE) * 0.04}s`, position:'relative' }}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg, transparent, rgba(123,47,190,0.8), rgba(199,125,255,0.6), transparent)', zIndex:2 }} />
                  <div style={{ position:'relative', width:'100%', paddingTop:'133%', background:'#080808', overflow:'hidden' }}>
                    <img className="card-img" src={coverImg(game.appId || 0)} alt={game.title}
                      loading="lazy"
                      style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}
                      onError={e => { const aid = game.appId || 0; (e.target as HTMLImageElement).src = COVER_OVERRIDES[aid] || (aid > 0 ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${aid}/header.jpg` : COVER_PLACEHOLDER); }}
                    />
                    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'40%', background:'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)', zIndex:1 }} />
                    {game.discount && (
                      <div style={{ position:'absolute', top:10, left:10, background:C.green, color:'white', padding:'4px 9px', borderRadius:6, fontSize:12, fontWeight:800, zIndex:2 }}>-{game.discount}%</div>
                    )}
                    {game.price === 'Grátis' && (
                      <div style={{ position:'absolute', top:10, left:10, background:C.green, color:'white', padding:'4px 9px', borderRadius:6, fontSize:12, fontWeight:800, zIndex:2 }}>GRÁTIS</div>
                    )}
                    {game.variants && game.variants.length > 1 && (
                      <div style={{ position:'absolute', top:10, right:10, background:'rgba(123,47,190,0.85)', color:'white', padding:'4px 9px', borderRadius:6, fontSize:11, fontWeight:700, zIndex:2 }}>+DLC</div>
                    )}
                  </div>

                  <div style={{ padding:'14px 14px 16px', display:'flex', flexDirection:'column', gap:10, flex:1 }}>
                    <h3 style={{ fontSize:14, fontWeight:700, color:'#ffffff', lineHeight:1.35, minHeight:36, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{game.title}</h3>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'auto' }}>
                      <div style={{ display:'flex', flexDirection:'column' }}>
                        {game.originalPrice && <span style={{ fontSize:10, color:C.textMuted, textDecoration:'line-through' }}>{game.originalPrice}</span>}
                        <span style={{ fontSize:19, fontWeight:900, color:game.price==='Grátis' ? C.green : '#ffffff' }}>{game.price}</span>
                      </div>
                    </div>
                    <button className="btn-glow" onClick={e => { e.stopPropagation(); onGame(game); }}
                      style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'11px 0', borderRadius:10, background:`linear-gradient(135deg, ${C.primary}, #9D4EDD)`, border:'1px solid rgba(199,125,255,0.3)', color:'white', fontSize:13, fontWeight:800, cursor:'pointer', boxShadow:'0 4px 15px rgba(123,47,190,0.4)' }}>
                      <ShoppingCart size={14} />
                      Comprar agora
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div ref={sentinelRef} style={{ marginTop:40, padding:'24px 0', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                <div style={{ width:38, height:38, borderRadius:'50%', border:`3px solid ${C.border}`, borderTopColor:C.secondary, animation:'spin 0.9s linear infinite' }} />
                <span style={{ color:C.textMuted, fontSize:13 }}>Carregando mais jogos…</span>
                <button onClick={() => setVisibleCount(c => Math.min(c + PAGE_SIZE, list.length))}
                  style={{ marginTop:4, padding:'10px 22px', borderRadius:10, background:'rgba(123,47,190,0.15)', border:`1px solid ${C.border}`, color:C.text, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  Carregar mais 16
                </button>
              </div>
            )}

            {!hasMore && visible.length > PAGE_SIZE && (
              <div style={{ marginTop:40, textAlign:'center', color:C.textMuted, fontSize:13 }}>
                Você chegou ao fim — {list.length} jogos exibidos.
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   NUUVEM-STYLE PRODUCT PAGE MODAL
═══════════════════════════════════════════════════════════ */
interface PurchaseItem {
  id?: number;
  title: string;
  price: string;
  originalPrice?: string;
  discount?: number;
  appId?: number;
  coverUrl?: string;
  variants?: GameVariant[];
}

/* ═══════════════════════════════════════════════════════════
   CARRINHO — TIPOS, STORAGE E HOOK GLOBAL
═══════════════════════════════════════════════════════════ */
interface CartItem extends PurchaseItem {
  cartId: string;     // identificador único do item dentro do carrinho
  quantity: number;
  variantLabel?: string;
}

const CART_STORAGE_KEY = 'neplim_cart';

function parsePriceStr(p: string): number {
  return parseFloat(p.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) || 0;
}
function formatPriceStr(v: number): string {
  return 'R$ ' + v.toFixed(2).replace('.', ',');
}

function loadCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Carrega o carrinho salvo assim que o componente monta (apenas no browser)
  useEffect(() => {
    setItems(loadCartFromStorage());
    setLoaded(true);
  }, []);

  // Salva no localStorage sempre que o carrinho mudar (depois do load inicial)
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage indisponível (ex: modo privado) — ignora silenciosamente
    }
  }, [items, loaded]);

  const addToCart = (product: PurchaseItem, variantLabel?: string) => {
    setItems(prev => {
      // Mesmo produto + mesma variante já está no carrinho? Só soma 1 na quantidade.
      const idx = prev.findIndex(i => i.title === product.title && i.variantLabel === variantLabel);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      const newItem: CartItem = {
        ...product,
        cartId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        quantity: 1,
        variantLabel
      };
      return [...prev, newItem];
    });
  };

  const removeFromCart = (cartId: string) => {
    setItems(prev => prev.filter(i => i.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    setItems(prev => prev.map(i => i.cartId === cartId ? { ...i, quantity: Math.max(1, quantity) } : i));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + parsePriceStr(i.price) * i.quantity, 0);

  return { items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice };
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT PAGE MODAL — COM BOTÕES NO LADO ESQUERDO E DISCORD
═══════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════
   PRODUCT PAGE MODAL — TEMPLATE EXPANDIDO COM ESTEIRA DE FADE
═══════════════════════════════════════════════════════════ */

const FEEDBACKS_DATA = [
  { name: "Lucas Silva", text: "Entrega instantânea! O código Pix gerou e em menos de 10 segundos a chave Steam já estava no meu e-mail. Recomendo muito!", date: "Há 2 dias" },
  { name: "Guilherme S.", text: "Suporte pelo Discord foi super atencioso e tirou todas as minhas dúvidas sobre as DLCs. Perfeito.", date: "Há 1 semana" },
  { name: "Mariana Costa", text: "Preço imbatível e confiável. Ativação global funcionou perfeitamente na minha conta principal.", date: "Há 3 semanas" },
  { name: "Rodrigo M.", text: "Já comprei 3 vezes na Neplim Store e todas as vezes as chaves foram entregues na hora. Muito seguro!", date: "Há 1 mês" },
  { name: "Amanda Souza", text: "O suporte é o diferencial. Me ajudaram a instalar e ativar tudo bem direitinho de madrugada.", date: "Há 3 dias" }
];

interface ProductPageModalProps {
  item: {
    id?: number;
    title: string;
    price: string;
    originalPrice?: string;
    discount?: number;
    category?: string;
    appId?: number;
    description?: string;
  };
  onClose: () => void;
  onConfirm: (item: any, variant: string) => void;
  onAddToCart: (item: any, variant: string) => void;
}

const ProductPageModal: React.FC<ProductPageModalProps> = ({ item, onClose, onConfirm, onAddToCart }) => {
  const [selectedEdition, setSelectedEdition] = useState<'base' | 'dlc'>('base');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const styleId = "marquee-animation-style";
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement("style");
      styleEl.id = styleId;
      styleEl.innerHTML = `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `;
      document.head.appendChild(styleEl);
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!item) return null;

  const title = item.title || "Jogo Digital";
  const discountAmount = item.discount || 88;
  const originalPriceStr = item.originalPrice || "R$ 349,90";
  
  const basePriceRaw = parseFloat(item.price.replace('R$', '').replace('.', '').replace(',', '.').trim()) || 33.90;
  
  const priceBaseStr = item.price; 
  const priceDlcStr = `R$ ${(basePriceRaw * 1.45).toFixed(2).replace('.', ',')}`;
  const savingsCalc = `R$ ${(parseFloat(originalPriceStr.replace('R$', '').replace('.', '').replace(',', '.').trim()) - basePriceRaw).toFixed(2).replace('.', ',')}`;

  const fallbackCover = "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600";
  const fallbackHero = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200";

  const leftBgBanner = item.appId
    ? `https://cdn.akamai.steamstatic.com/steam/apps/${item.appId}/library_hero.jpg`
    : fallbackHero;

  const leftBgAlt = item.appId
    ? `https://cdn.akamai.steamstatic.com/steam/apps/${item.appId}/header.jpg`
    : fallbackHero;

  const coverBase = item.appId 
    ? `https://cdn.akamai.steamstatic.com/steam/apps/${item.appId}/library_600x900_2x.jpg`
    : fallbackCover;

  const coverDlc = item.appId
    ? `https://cdn.akamai.steamstatic.com/steam/apps/${item.appId}/library_600x900_2x.jpg`
    : fallbackCover;

  const faqData = [
    { q: "Como vou receber o jogo?", a: "Após a aprovação do pagamento, um código de resgate é exibido na tela e salvo em 'Minhas Compras'. Basta abrir um ticket na aba COMPRAS do nosso servidor do Discord e enviar o código para receber sua Steam Key." },
    { q: "O jogo é original e vitalício?", a: "Sim, todos os nossos produtos são licenças digitais oficiais adquiridas legalmente, vinculando-se para sempre à sua biblioteca." },
    { q: "Posso pedir reembolso caso desista?", a: "Por se tratar de um produto digital que é revelado instantaneamente, só realizamos trocas se houver algum problemático técnico comprovado na chave antes do uso." },
    { q: "O jogo funciona em qualquer região?", a: "Sim, garantimos ativação global livre de restrições de região (Worldwide Region Free)." }
  ];

  const similarProducts = [
    { title: "Cyberpunk 2077", price: "R$ 49,90", discount: 75, appId: 1091500 },
    { title: "Elden Ring", price: "R$ 89,90", discount: 60, appId: 1245620 },
    { title: "The Witcher 3: Wild Hunt", price: "R$ 19,90", discount: 80, appId: 292030 },
    { title: "Red Dead Redemption 2", price: "R$ 59,90", discount: 67, appId: 1174180 }
  ];

  const marqueeFeedbacks = [...FEEDBACKS_DATA, ...FEEDBACKS_DATA];

  return (
    <div style={{ 
      position: 'fixed', inset: 0, backgroundColor: '#060609', zIndex: 9999, 
      fontFamily: 'system-ui, sans-serif', color: '#FFFFFF', overflowY: 'auto'
    }}>
      
      {/* SEÇÃO SUPERIOR */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', minHeight: '100vh', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        
        {/* LADO ESQUERDO */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', backgroundColor: '#0c0c12', overflow: 'hidden' }}>
          <img 
            src={leftBgBanner} 
            alt="Visual"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', zIndex: 0 }}
            onError={(e) => {
              if (e.currentTarget.src !== leftBgAlt) { e.currentTarget.src = leftBgAlt; } 
              else { e.currentTarget.src = fallbackHero; }
            }}
          />
          
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(6,6,9,0.75) 30%, #060609 98%), linear-gradient(to top, rgba(6,6,9,0.85) 0%, rgba(6,6,9,0.4) 100%)', zIndex: 1 }} />

          <div style={{ position: 'absolute', top: '32px', left: '40px', zIndex: 3 }}>
            <button onClick={onClose} style={{ background: 'rgba(6, 6, 9, 0.75)', border: '1px solid rgba(123,47,190,0.4)', color: '#FFF', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, backdropFilter: 'blur(8px)' }}>
              ← Voltar para a Loja
            </button>
          </div>

          <div style={{ position: 'relative', zIndex: 2, maxWidth: '580px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              <span style={{ backgroundColor: '#7b2fbe', color: '#FFF', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700 }}>
                🔥 {discountAmount}% OFF
              </span>
              <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#10b981', border: `1px solid rgba(16, 185, 129, 0.2)`, padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
                ✓ 23 em estoque
              </span>
              <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
                🔗 Chave Steam
              </span>
            </div>
            
            <h1 style={{ fontSize: '48px', fontWeight: 800, margin: '0 0 20px 0', lineHeight: '1.15' }}>{title}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>{originalPriceStr}</span>
              <span style={{ fontSize: '18px', color: '#a855f7', fontWeight: 700 }}>-{discountAmount}%</span>
              <span style={{ fontSize: '52px', fontWeight: 900, color: '#FFF' }}>{priceBaseStr}</span>
            </div>
            
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', margin: '0 0 4px 0' }}>Você economiza {savingsCalc}</p>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '15px', fontWeight: 500, margin: '0 0 24px 0' }}>À vista no Pix</p>

            <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:28, width:'100%', maxWidth:'440px' }}>
              <div style={{ display:'flex', gap:10, width:'100%' }}>
                <button 
                  onClick={() => onConfirm(item, selectedEdition === 'base' ? 'Standard Edition' : 'Complete Edition + All DLCs')}
                  style={{ flex:1, padding:'18px', background: 'linear-gradient(135deg, #7b2fbe, #a855f7)', border: 'none', borderRadius: '10px', color: '#FFF', fontWeight: 700, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(123, 47, 190, 0.3)' }}
                >
                  <CreditCard size={20} /> Comprar agora
                </button>
                <button
                  onClick={() => {
                    onAddToCart(item, selectedEdition === 'base' ? 'Standard Edition' : 'Complete Edition + All DLCs');
                    setAddedFeedback(true);
                    setTimeout(() => setAddedFeedback(false), 1800);
                  }}
                  style={{ flexShrink:0, width:60, padding:'18px 0', background: addedFeedback ? C.green : 'rgba(255,255,255,0.08)', border: `1px solid ${addedFeedback ? C.green : 'rgba(255,255,255,0.16)'}`, borderRadius: '10px', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition:'background 0.2s, border-color 0.2s' }}
                  title="Adicionar ao carrinho"
                >
                  {addedFeedback ? <CheckCircle size={20} /> : <ShoppingCart size={20} />}
                </button>
              </div>
              {addedFeedback && (
                <p style={{ color: C.green, fontSize: 13, fontWeight: 600, margin: 0, textAlign:'center' }}>
                  Adicionado ao carrinho!
                </p>
              )}
              
              <a 
                href="https://discord.gg/ZqZSYv32xY" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ width: '100%', padding: '14px', backgroundColor: '#5865F2', border: 'none', borderRadius: '10px', color: '#FFF', fontWeight: 600, fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(88, 101, 242, 0.2)' }}
              >
                <Users size={18} /> Entrar no nosso Discord
              </a>
            </div>

            <div style={{ backgroundColor: 'rgba(12, 12, 18, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '20px', backdropFilter: 'blur(10px)' }}>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                {item.description || "Adquira agora a sua licença digital vitalícia com suporte completo, atualizações automáticas e garantia de ativação global segura na plataforma oficial."}
              </p>
            </div>
          </div>
        </div>

        {/* LADO DIREITO */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 80px', boxSizing: 'border-box', backgroundColor: '#060609', zIndex: 2 }}>
          <div style={{ marginBottom: '32px' }}>
            <span style={{ fontSize: '12px', color: '#a855f7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>PASSO OBRIGATÓRIO</span>
            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 0 0' }}>Escolha a edição do jogo</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', width: '100%', marginBottom: '40px' }}>
            <div onClick={() => setSelectedEdition('base')} style={{ backgroundColor: '#0c0c12', borderRadius: '16px', border: `2px solid ${selectedEdition === 'base' ? '#7b2fbe' : 'rgba(255,255,255,0.03)'}`, padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', boxShadow: selectedEdition === 'base' ? '0 0 25px rgba(123, 47, 190, 0.3)' : 'none' }}>
              <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', aspectRatio: '2/3', marginBottom: '16px', backgroundColor: '#060609' }}>
                <img src={coverBase} alt="Standard" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = leftBgAlt; }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>Jogo Base</h3>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${selectedEdition === 'base' ? '#7b2fbe' : 'rgba(255,255,255,0.2)'}`, backgroundColor: selectedEdition === 'base' ? '#7b2fbe' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selectedEdition === 'base' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFF' }} />}
                </div>
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px', margin: '0 0 16px 0', lineHeight: '1.4' }}>Versão digital padrão contendo o jogo completo de forma imediata.</p>
              <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '22px', fontWeight: 800 }}>{priceBaseStr}</span>
              </div>
            </div>

            <div onClick={() => setSelectedEdition('dlc')} style={{ backgroundColor: '#0c0c12', borderRadius: '16px', border: `2px solid ${selectedEdition === 'dlc' ? '#7b2fbe' : 'rgba(255,255,255,0.03)'}`, padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', boxShadow: selectedEdition === 'dlc' ? '0 0 25px rgba(123, 47, 190, 0.3)' : 'none' }}>
              <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', aspectRatio: '2/3', marginBottom: '16px', backgroundColor: '#060609' }}>
                <img src={coverDlc} alt="Complete" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = leftBgAlt; }} />
                <span style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#7b2fbe', color: '#FFF', padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>RECOMENDADO</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>Jogo Base + DLCs</h3>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${selectedEdition === 'dlc' ? '#7b2fbe' : 'rgba(255,255,255,0.2)'}`, backgroundColor: selectedEdition === 'dlc' ? '#7b2fbe' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selectedEdition === 'dlc' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFF' }} />}
                </div>
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px', margin: '0 0 16px 0', lineHeight: '1.4' }}>Acompanha todas as expansões, pacotes adicionais e bônus Deluxe lançados.</p>
              <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '22px', fontWeight: 800 }}>{priceDlcStr}</span>
              </div>
            </div>
          </div>

          <div style={{ width: '100%', display: 'flex', gap: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', justifyContent: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldCheck size={16} color="#10b981" /> Entrega Imediata</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={16} color="#7b2fbe" /> Ativação Garantida</span>
          </div>
        </div>

      </div>

      {/* SEÇÃO INFERIOR AMPLIADA (MÁX: 1400PX) */}
      <div style={{ padding: '80px 80px', backgroundColor: '#060609', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '80px' }}>
        
        {/* 1. COMPRAR DE FORMA SEGURA */}
        <div style={{ backgroundColor: '#0c0c12', border: '1px solid rgba(123,47,190,0.15)', borderRadius: '20px', padding: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <ShieldCheck size={28} color="#7b2fbe" />
            <h3 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '0.5px' }}>COMPRAR DE FORMA SEGURA</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
              <CreditCard size={26} color="#7b2fbe" style={{ flexShrink: 0, marginTop: '4px' }} />
              <div>
                <h4 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 8px 0' }}>PIX Automático</h4>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: '1.5' }}>O seu produto é entregue de forma imediata após a aprovação do pagamento.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
              <Users size={26} color="#7b2fbe" style={{ flexShrink: 0, marginTop: '4px' }} />
              <div>
                <h4 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 8px 0' }}>Suporte Dedicado</h4>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: '1.5' }}>Equipa pronta para o ajudar e tirar dúvidas diretamente no nosso Discord oficial.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
              <Key size={26} color="#7b2fbe" style={{ flexShrink: 0, marginTop: '4px' }} />
              <div>
                <h4 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 8px 0' }}>Privacidade Garantida</h4>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: '1.5' }}>Os seus dados estão totalmente protegidos num ambiente criptografado e seguro.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. FEEDBACKS — ESTEIRA GRANDE COM FADE NAS PONTAS */}
        <div style={{ width: '100%', position: 'relative' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⭐ Avaliações e Feedbacks
          </h3>

          <div style={{ 
            width: '100%', 
            overflow: 'hidden', 
            position: 'relative',
            maskImage: 'linear-gradient(to right, transparent 0%, #000 6%, #000 94%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 6%, #000 94%, transparent 100%)'
          }}>
            <div style={{ 
              display: 'flex', 
              gap: '32px', 
              width: 'max-content',
              animation: 'marquee 28s linear infinite', // Velocidade ajustada para os cards maiores
            }}
            onMouseEnter={(e) => e.currentTarget.style.animationPlayState = 'paused'}
            onMouseLeave={(e) => e.currentTarget.style.animationPlayState = 'running'}
            >
              {marqueeFeedbacks.map((f, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    width: '460px', // Aumentado o tamanho individual de cada card de feedback
                    flexShrink: 0,
                    backgroundColor: '#0c0c12', 
                    padding: '32px', // Mais espaçamento interno
                    borderRadius: '20px', 
                    border: '1px solid rgba(123,47,190,0.15)',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 700, fontSize: '17px', color: '#FFF' }}>{f.name}</span>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>{f.date}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#a855f7" color="#a855f7" />)}
                  </div>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: '1.6' }}>
                    "{f.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. PRODUTOS SIMILARES */}
        <div>
          <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🛍️ Produtos Similares
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '24px' }}>
            {similarProducts.map((p, idx) => (
              <div key={idx} style={{ backgroundColor: '#0c0c12', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.02)' }}>
                <div style={{ aspectRatio: '16/10', backgroundColor: '#060609' }}>
                  <img src={`https://cdn.akamai.steamstatic.com/steam/apps/${p.appId}/header.jpg`} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '20px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 10px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '17px', fontWeight: 800, color: '#FFF' }}>{p.price}</span>
                    <span style={{ fontSize: '12px', color: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>-{p.discount}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. PERGUNTAS FREQUENTES */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '28px' }}>
            ❓ Perguntas Frequentes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqData.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  style={{ 
                    backgroundColor: '#0c0c12', 
                    borderRadius: '14px', 
                    border: `1px solid ${isOpen ? 'rgba(123, 47, 190, 0.4)' : 'rgba(255, 255, 255, 0.03)'}`,
                    overflow: 'hidden',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <button 
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{ 
                      width: '100%', padding: '24px', background: 'transparent', border: 'none', 
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                      cursor: 'pointer', textAlign: 'left', color: '#FFF'
                    }}
                  >
                    <span style={{ fontSize: '16px', fontWeight: 600, color: isOpen ? '#C77DFF' : '#FFF' }}>
                      {faq.q}
                    </span>
                    <ChevronDown 
                      size={20} 
                      style={{ 
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                        transition: 'transform 0.25s ease',
                        color: isOpen ? '#a855f7' : 'rgba(255,255,255,0.4)'
                      }} 
                    />
                  </button>

                  <div style={{ 
                    maxHeight: isOpen ? '250px' : '0px',
                    opacity: isOpen ? 1 : 0,
                    transition: 'all 0.25s ease-in-out',
                    padding: isOpen ? '0px 24px 24px 24px' : '0px 24px'
                  }}>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: '1.6', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '14px' }}>
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
/* ═══════════════════════════════════════════════════════════
   CHECKOUT CONFIRMATION MODAL
═══════════════════════════════════════════════════════════ */
function CheckoutModal({ item, cartItems, onClose, accountEmail, accountName, onCheckoutSuccess }: { item: PurchaseItem; cartItems?: CartItem[]; onClose: () => void; accountEmail: string; accountName: string; onCheckoutSuccess?: () => void }) {
  // Quando vem do carrinho (cartItems preenchido), tratamos como um "pedido" único:
  // o preço unitário do item virtual já é a SOMA de todos os produtos do carrinho,
  // e a quantidade (qty) do checkout fica fixa em 1 — afinal cada produto do
  // carrinho já tem sua própria quantidade somada no total.
  const isCartCheckout = !!cartItems && cartItems.length > 0;
  const cartTotal = isCartCheckout ? cartItems!.reduce((sum, i) => sum + parsePriceStr(i.price) * i.quantity, 0) : 0;
  const cartTitleSummary = isCartCheckout
    ? cartItems!.map(i => `${i.quantity}x ${i.title}`).join(', ')
    : '';

  const effectiveItem: PurchaseItem = isCartCheckout
    ? { title: cartTitleSummary, price: formatPriceStr(cartTotal) }
    : item;

  const [method, setMethod] = useState<'pix'|'card'>('pix');
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponPercent, setCouponPercent] = useState(0);
  const [name, setName] = useState(accountName);
  const [email, setEmail] = useState(accountEmail);
  const [terms, setTerms] = useState(false);

  // ESTADOS DO PIX REAL
  const [dynamicPixCode, setDynamicPixCode] = useState('');
  const [pixQrCodeBase64, setPixQrCodeBase64] = useState('');
  const [loadingPix, setLoadingPix] = useState(false);

  // GERADOR DE KEY ALEATÓRIA (tela de Recebimento)
  const [gameKey, setGameKey] = useState('');
  const [keyCopied, setKeyCopied] = useState(false);
  const gerarKeyAleatoria = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bloco = () => Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${bloco()}-${bloco()}-${bloco()}-${bloco()}`;
  };
  const handleCopyKey = () => {
    if (!gameKey) return;
    navigator.clipboard.writeText(gameKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  // ═══════════════════════════════════════════════
  // CARTÃO DE CRÉDITO/DÉBITO (Mercado Pago SDK no navegador)
  // ═══════════════════════════════════════════════
  const mpRef = useRef<any>(null);
  const [mpReady, setMpReady] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardCpf, setCardCpf] = useState('');
  const [cardPaymentMethodId, setCardPaymentMethodId] = useState('');
  const [cardIssuerId, setCardIssuerId] = useState('');
  const [installments, setInstallments] = useState(1);
  const [installmentOptions, setInstallmentOptions] = useState<{ installments: number; label: string }[]>([{ installments: 1, label: '1x sem juros' }]);
  const [cardLoading, setCardLoading] = useState(false);
  const [cardError, setCardError] = useState('');

  // Carrega o SDK do Mercado Pago (uma única vez)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as any;
    if (w.MercadoPago) {
      mpRef.current = new w.MercadoPago(MP_PUBLIC_KEY, { locale: 'pt-BR' });
      setMpReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => {
      mpRef.current = new w.MercadoPago(MP_PUBLIC_KEY, { locale: 'pt-BR' });
      setMpReady(true);
    };
    document.body.appendChild(script);
  }, []);

  // Formata o número do cartão e consulta bandeira/parcelas pelo BIN (6 primeiros dígitos)
  const handleCardNumberChange = async (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);

    if (digits.length >= 6 && mpRef.current) {
      const bin = digits.slice(0, 6);
      try {
        const methods = await mpRef.current.getPaymentMethods({ bin });
        if (methods?.results?.length) {
          setCardPaymentMethodId(methods.results[0].id);
          setCardIssuerId(methods.results[0].issuer?.id || '');
        }
        const inst = await mpRef.current.getInstallments({ amount: String(total), locale: 'pt-BR', bin });
        if (inst?.length && inst[0].payer_costs?.length) {
          setInstallmentOptions(inst[0].payer_costs.map((pc: any) => ({
            installments: pc.installments,
            label: `${pc.installments}x de ${fmt(pc.installment_amount)}${pc.installment_rate > 0 ? '' : ' sem juros'}`
          })));
        }
      } catch (e) {
        console.error('Erro ao consultar bandeira/parcelas:', e);
      }
    }
  };

  const pagarComCartao = async () => {
    setCardError('');
    if (!accountEmail) { alert("Você precisa estar logado para finalizar a compra."); return; }
    if (!terms) { alert("Você precisa aceitar os termos e condições antes de pagar."); return; }
    if (!name.trim()) { alert("Por favor, preencha seu Nome antes de pagar."); return; }
    if (MP_PUBLIC_KEY === 'SUA_PUBLIC_KEY_AQUI') { setCardError('Public Key do Mercado Pago não configurada no código.'); return; }
    if (!mpReady || !mpRef.current) { setCardError('Carregando sistema de pagamento, aguarde um instante...'); return; }

    const digits = cardNumber.replace(/\D/g, '');
    const [mm, yy] = cardExpiry.split('/').map(s => s?.trim());
    const cpfDigits = cardCpf.replace(/\D/g, '');

    if (digits.length < 13 || !mm || !yy || cardCvv.length < 3 || !cardName.trim() || cpfDigits.length !== 11) {
      setCardError('Preencha todos os dados do cartão e o CPF corretamente.');
      return;
    }
    if (!cardPaymentMethodId) {
      setCardError('Não foi possível identificar a bandeira do cartão. Confira o número.');
      return;
    }

    setCardLoading(true);
    try {
      const tokenResp = await mpRef.current.createCardToken({
        cardNumber: digits,
        cardholderName: cardName,
        cardExpirationMonth: mm,
        cardExpirationYear: yy.length === 2 ? `20${yy}` : yy,
        securityCode: cardCvv,
        identificationType: 'CPF',
        identificationNumber: cpfDigits
      });

      if (!tokenResp?.id) {
        setCardError('Não foi possível validar o cartão. Confira os dados e tente novamente.');
        setCardLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/criar-pagamento-cartao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenResp.id,
          payment_method_id: cardPaymentMethodId,
          issuer_id: cardIssuerId,
          installments,
          valor: total,
          emailUsuario: accountEmail || email,
          tituloJogo: isCartCheckout ? effectiveItem.title : `${qty}x ${item.title}`,
          appId: isCartCheckout ? cartItems?.[0]?.appId : (item as any)?.appId,
          cupom: couponPercent > 0 ? coupon.trim().toUpperCase() : undefined,
          cpf: cpfDigits
        })
      });
      const data = await res.json();

      if (!res.ok) { setCardError(data.erro || 'Pagamento recusado.'); setCardLoading(false); return; }

      if (data.status === 'approved') {
        setPaymentStatus('approved');
        setGameKey(data.chave || data.steam_key || data.support_code || data.codigo_suporte || data.code || gerarKeyAleatoria());
        setDone(true);
        onCheckoutSuccess?.();
      } else if (data.status === 'in_process' || data.status === 'pending') {
        setPaymentStatus('pending');
        setPaymentId(data.id); // o polling existente (useEffect abaixo) assume daqui
      } else {
        setPaymentStatus('rejected');
        setCardError('Pagamento recusado pela operadora do cartão. Tente outro cartão.');
      }
    } catch (err) {
      console.error(err);
      setCardError('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setCardLoading(false);
    }
  };

  // ESTADOS DO VERIFICADOR DE PAGAMENTO
  const [paymentId, setPaymentId] = useState<string | number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'approved' | 'rejected' | 'error'>('idle');

  const parsePrice = (p: string) => parseFloat(p.replace('R$','').replace('.','').replace(',','.').trim()) || 0;
  const basePrice = parsePrice(effectiveItem.price);
  const subtotal = basePrice * qty;
  const total = Math.max(0, subtotal - discount);
  const fmt = (v: number) => 'R$ ' + v.toFixed(2).replace('.',',');

  // No checkout do carrinho, o "total" já vem somado de todos os produtos,
  // então a quantidade fica travada em 1 (cada produto já tem sua própria
  // quantidade contabilizada dentro do total).
  useEffect(() => {
    if (isCartCheckout) setQty(1);
  }, [isCartCheckout]);

  // FUNÇÃO QUE CONECTA COM O BACK-END
  const gerarPixAutomatico = async () => {
    if (!accountEmail) {
      alert("Você precisa estar logado para finalizar a compra.");
      return;
    }
    if (!terms) {
      alert("Você precisa aceitar os termos e condições antes de gerar o pagamento.");
      return;
    }
    if (!name.trim()) {
      alert("Por favor, preencha seu Nome antes de gerar o pagamento.");
      return;
    }

    setLoadingPix(true);
    try {
      const response = await fetch(`${API_BASE}/criar-pix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor: total,
          emailUsuario: accountEmail || email,
          tituloJogo: isCartCheckout ? effectiveItem.title : `${qty}x ${item.title}`,
          appId: isCartCheckout ? cartItems?.[0]?.appId : (item as any)?.appId,
          cupom: couponPercent > 0 ? coupon.trim().toUpperCase() : undefined
        })
      });

      const data = await response.json();

      if (data.qr_code) {
        setDynamicPixCode(data.qr_code);
        setPixQrCodeBase64(data.qr_code_base64);
        setPaymentId(data.id);
        setPaymentStatus('pending');
      } else {
        alert(data.erro || "Não foi possível gerar o Pix. Verifique o console do back-end.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com o servidor do back-end. Certifique-se de que ele está rodando na porta 3001.");
    } finally {
      setLoadingPix(false);
    }
  };

  const handleCopyPix = () => {
    if (!dynamicPixCode) return;
    navigator.clipboard.writeText(dynamicPixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [couponMsg, setCouponMsg] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const applyCoupon = async () => {
    const c = coupon.trim().toUpperCase();
    if (!c) return;
    setCouponMsg('');
    setCouponLoading(true);
    try {
      const appId = isCartCheckout
        ? cartItems?.[0]?.appId
        : (item as any)?.appId;
      const res = await fetch(`${API_BASE}/validar-cupom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: c, appId })
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponPercent(0);
        setDiscount(0);
        setCouponMsg(data.erro || 'Cupom inválido.');
      } else {
        setCouponPercent(data.percentual);
        setDiscount(subtotal * (data.percentual / 100));
        setCouponMsg(`✓ Cupom aplicado! -${data.percentual}% de desconto`);
      }
    } catch {
      setCouponMsg('Erro ao validar cupom. Tente novamente.');
    } finally {
      setCouponLoading(false);
    }
  };

  useEffect(() => {
    setDynamicPixCode('');
    setPaymentId(null);
    setPaymentStatus('idle');
  }, [qty, discount]);

  // Recalcula o desconto sempre que o subtotal mudar (ex: item removido do carrinho)
  useEffect(() => {
    if (couponPercent > 0) {
      setDiscount(subtotal * (couponPercent / 100));
    }
  }, [subtotal, couponPercent]);

  // VERIFICADOR DE PAGAMENTO: consulta o status a cada 4s enquanto estiver pendente.
  // Quando aprovar, avança automaticamente para a tela de confirmação.
  useEffect(() => {
    if (paymentStatus !== 'pending' || !paymentId) return;

    const interval = setInterval(async () => {
     try {
        // 1. CORREÇÃO: Evita fazer o fetch se o ID estiver vazio, nulo ou indefinido
        if (!paymentId || paymentId === 'undefined') {
          return; 
        }

        // 2. CORREÇÃO: Garante o uso de crases (``) para a interpolação da URL funcionar
        const resp = await fetch(`${API_BASE}/status-pagamento/${paymentId}`);

        // 3. CORREÇÃO: Se o servidor responder com erro (HTML), lê como texto para não quebrar o app
        if (!resp.ok) {
          const textoErro = await resp.text();
          console.error("O servidor retornou um erro (HTML):", textoErro);
          return;
        }

        // 4. Só transforma em JSON se a resposta do servidor for válida (Status 200 OK)
        const data = await resp.json();

        if (data && data.status === 'approved') {
          setPaymentStatus('approved');
          setGameKey(data.chave || data.steam_key || data.support_code || data.codigo_suporte || data.code || gerarKeyAleatoria());
          setDone(true);
          onCheckoutSuccess?.();
        } else if (data.status === 'rejected' || data.status === 'cancelled') {
          setPaymentStatus('rejected');
        }
        // se status continuar "pending", o loop simplesmente continua tentando
      } catch (err) {
        console.error("Erro ao verificar status do pagamento:", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [paymentStatus, paymentId]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const coverUrl = effectiveItem.appId
    ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${effectiveItem.appId}/header.jpg`
    : '';

  if (done) return (
    <div style={{ position:'fixed', inset:0, zIndex:1100, background:'#111', overflowY:'auto', overflowX:'hidden', fontFamily:'system-ui,sans-serif', boxSizing:'border-box' }}>
      <style>{`
        @keyframes popIn { from{transform:scale(0.85);opacity:0} to{transform:scale(1);opacity:1} }
      `}</style>

      {/* Header — mesmo do checkout */}
      <div style={{ background:'#1a1a1a', borderBottom:'1px solid #2a2a2a', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10, maxWidth:'100%', boxSizing:'border-box' }}>
        <div style={{ fontWeight:900, fontSize:20, color:'#fff', fontStyle:'italic' }}>Neplim Store</div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ background:'#1e2e1e', border:'1px solid #2d4a2d', color:'#4caf6e', borderRadius:20, padding:'6px 14px', fontSize:13, display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap' }}>
            <ShieldCheck size={13} /> Compra segura
          </div>
          <button onClick={onClose} style={{ background:'#2a2a2a', border:'none', color:'#aaa', width:34, height:34, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Steps — agora com Recebimento ativo */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'18px 0', borderBottom:'1px solid #1e1e1e', maxWidth:'100%', boxSizing:'border-box' }}>
        {[['Carrinho', true, false], ['Pagamento', true, false], ['Recebimento', false, true]].map(([label, isDone, isActive], i) => (
          <React.Fragment key={String(label)}>
            {i > 0 && <span style={{ color:'#444', fontSize:14 }}>›</span>}
            <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:14, color: isActive ? '#fff' : isDone ? '#4caf6e' : '#555', fontWeight: isActive ? 700 : 400 }}>
              <div style={{ width:22, height:22, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, background: isDone ? '#4caf6e' : isActive ? '#fff' : '#2a2a2a', color: isDone ? '#fff' : isActive ? '#111' : '#555', flexShrink:0 }}>
                {isDone ? <CheckCircle size={13} /> : i + 1}
              </div>
              {label}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Body — Key gerada */}
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '32px 20px 60px', boxSizing: 'border-box' }}>
        <div style={{ background:'#1a1a1a', border:`1px solid ${C.primary}`, borderRadius:16, padding:32, textAlign:'center', boxSizing:'border-box', animation:'popIn 0.35s ease' }}>
          <div style={{ width:68, height:68, borderRadius:'50%', background:'rgba(76,175,80,0.15)', border:'2px solid rgba(76,175,80,0.4)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <CheckCircle size={32} color={C.green} />
          </div>
          <h2 style={{ fontSize:22, fontWeight:900, color:'#fff', marginBottom:6 }}>Pagamento aprovado!</h2>
          <p style={{ color:'#888', fontSize:14, marginBottom:24 }}>
            Sua chave de <strong style={{ color:C.secondary }}>{effectiveItem.title}</strong> já está disponível abaixo.
          </p>

          {/* Card da Key — mesmo estilo do bloco do Pix */}
          <div style={{ background:'#111', border:'1px solid #2a2a2a', borderRadius:10, padding:'16px', marginBottom:16, boxSizing:'border-box' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, color:C.textMuted, fontSize:12, marginBottom:10 }}>
              <Key size={14} /> Sua Chave de Ativação (Steam Key)
            </div>
            <div style={{ display:'flex', gap:8, background:'#0a0a0a', border:`1px solid ${C.border}`, borderRadius:8, padding:'12px 14px', alignItems:'center' }}>
              <div style={{ flex:1, fontSize:16, fontWeight:700, letterSpacing:'1px', color:C.accent, fontFamily:'monospace', wordBreak:'break-all', textAlign:'left' }}>{gameKey}</div>
            </div>
            <button onClick={handleCopyKey} style={{ width:'100%', marginTop:10, background: keyCopied ? C.green : C.primary, border:'none', color:'white', borderRadius:8, padding:'11px', fontSize:14, fontWeight:700, cursor:'pointer' }}>
              {keyCopied ? 'Copiada!' : 'Copiar chave'}
            </button>
          </div>

          <p style={{ color:'#666', fontSize:12, lineHeight:1.6, marginBottom:24 }}>
            Guarde essa chave com cuidado. Ela também ficará disponível a qualquer momento em <strong style={{ color:'#999' }}>Minhas Compras</strong>.
          </p>

          <button onClick={onClose}
            style={{ width:'100%', padding:'14px', borderRadius:10, background:C.primary, border:'none', color:'white', fontWeight:700, fontSize:15, cursor:'pointer' }}>
            Voltar para a Loja
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1100, background:'#111', overflowY:'auto', overflowX:'hidden', fontFamily:'system-ui,sans-serif', boxSizing:'border-box' }}>
      <style>{`
        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 850px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Header */}
      <div style={{ background:'#1a1a1a', borderBottom:'1px solid #2a2a2a', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10, maxWidth:'100%', boxSizing:'border-box' }}>
        <div style={{ fontWeight:900, fontSize:20, color:'#fff', fontStyle:'italic' }}>Neplim Store</div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ background:'#1e2e1e', border:'1px solid #2d4a2d', color:'#4caf6e', borderRadius:20, padding:'6px 14px', fontSize:13, display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap' }}>
            <ShieldCheck size={13} /> Compra segura
          </div>
          <button onClick={onClose} style={{ background:'#2a2a2a', border:'none', color:'#aaa', width:34, height:34, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Steps */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'18px 0', borderBottom:'1px solid #1e1e1e', maxWidth:'100%', boxSizing:'border-box' }}>
        {[['Carrinho', true, false], ['Pagamento', false, true], ['Recebimento', false, false]].map(([label, isDone, isActive], i) => (
          <React.Fragment key={String(label)}>
            {i > 0 && <span style={{ color:'#444', fontSize:14 }}>›</span>}
            <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:14, color: isActive ? '#fff' : isDone ? '#4caf6e' : '#555', fontWeight: isActive ? 700 : 400 }}>
              <div style={{ width:22, height:22, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, background: isDone ? '#4caf6e' : isActive ? '#fff' : '#2a2a2a', color: isDone ? '#fff' : isActive ? '#111' : '#555', flexShrink:0 }}>
                {isDone ? <CheckCircle size={13} /> : i + 1}
              </div>
              {label}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Body Grid */}
      <div className="checkout-grid" style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px', boxSizing: 'border-box' }}>
        {/* LEFT — Formulários e Pagamentos */}
        <div style={{ display:'flex', flexDirection:'column', gap:16, width: '100%', boxSizing: 'border-box', minWidth: 0 }}>
          {/* Formas de pagamento */}
          <div style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:12, padding:20, boxSizing:'border-box' }}>
            <p style={{ fontWeight:700, fontSize:15, color:'#fff', marginBottom:14 }}>Formas de pagamento</p>
            <div onClick={() => setMethod('pix')} style={{ border:`1.5px solid ${method==='pix' ? '#4caf6e' : '#2a2a2a'}`, borderRadius:9, padding:'12px 14px', display:'flex', alignItems:'center', gap:12, cursor:'pointer', marginBottom:10, background: method==='pix' ? 'rgba(76,175,80,0.05)' : 'transparent', boxSizing:'border-box' }}>
              <div style={{ width:34, height:34, background:'#0d1f1a', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><CreditCard size={16} color="#4caf6e" /></div>
              <div style={{ minWidth:0, flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600, color:'#fff', display:'flex', alignItems:'center', gap:8 }}>Pix <span style={{ background:'#0d1f1a', color:'#4caf6e', fontSize:11, fontWeight:700, borderRadius:4, padding:'2px 7px', display:'flex', alignItems:'center', gap:3, whiteSpace:'nowrap' }}>⚡ Mais rápido</span></div>
                <div style={{ fontSize:12, color:'#666', marginTop:2 }}>Aprovação imediata</div>
              </div>
            </div>

          </div>

          {/* Informações de contato */}
          <div style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:12, padding:20, boxSizing:'border-box' }}>
            <p style={{ fontWeight:700, fontSize:15, color:'#fff', marginBottom:14 }}>Informações de contato</p>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome completo" style={{ width:'100%', background:'#111', border:'1px solid #2a2a2a', borderRadius:8, padding:'10px 12px', color:'#ccc', fontSize:14, marginBottom:10, outline:'none', boxSizing:'border-box' }} />
            <input value={email} readOnly placeholder="Email" type="email" style={{ width:'100%', background:'#0a0a0a', border:'1px solid #2a2a2a', borderRadius:8, padding:'10px 12px', color:'#888', fontSize:14, outline:'none', boxSizing:'border-box', cursor:'not-allowed' }} />
            <p style={{ color:'#666', fontSize:12, marginTop:6 }}>O e-mail é o da sua conta logada, para que a compra apareça em "Minhas Compras".</p>

            <div style={{ marginTop:14, background:'#111', border:'1px solid #2a2a2a', borderRadius:8, padding:'14px 16px', display:'flex', flexDirection:'column', gap:6, boxSizing:'border-box' }}>
    {!dynamicPixCode ? (
      <button onClick={gerarPixAutomatico} disabled={loadingPix} style={{ background: C.primary, border: 'none', color: 'white', borderRadius: 8, padding: '12px', fontWeight: 700, fontSize: 14, cursor: loadingPix ? 'not-allowed' : 'pointer' }}>
        {loadingPix ? `Gerando Pix de R$ ${total.toFixed(2)}...` : 'Gerar Código Pix para Pagamento'}
      </button>
    ) : (
      <>
        {/* ⬇️ SEU NOVO BLOCO DE QR CODE PIX ⬇️ */}
        {pixQrCodeBase64 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            background: '#FFFFFF', // Fundo branco obrigatório para o celular conseguir ler o QR code
            padding: '12px', 
            borderRadius: '8px', 
            width: 'fit-content', 
            margin: '6px auto 16px auto',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
          }}>
            <img 
              src={`data:image/jpeg;base64,${pixQrCodeBase64}`} 
              alt="QR Code Pix" 
              style={{ width: '180px', height: '180px', display: 'block' }}
            />
          </div>
        )}

        <div style={{ fontSize:12, color:'#aaa', fontWeight:500, whiteSpace:'nowrap', textOverflow:'ellipsis', overflow:'hidden' }}>Clique no botão abaixo para copiar o código Pix:</div>
        <div style={{ display:'flex', gap:8, background:'#0a0a0a', border:'1px solid #222', borderRadius:6, padding:'6px 10px', alignItems:'center', overflow:'hidden', boxSizing:'border-box' }}>
          <div style={{ fontSize:11, color:'#666', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{dynamicPixCode}</div>
          <button onClick={handleCopyPix} style={{ background: copied ? C.green : C.primary, border:'none', color:'white', borderRadius:4, padding:'6px 14px', fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>

        {/* VERIFICADOR DE PAGAMENTO */}
        {paymentStatus === 'pending' && (
          <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:10, padding:'10px 12px', background:'rgba(255,193,7,0.08)', border:'1px solid rgba(255,193,7,0.3)', borderRadius:8 }}>
            <div style={{ width:14, height:14, border:'2px solid rgba(255,193,7,0.3)', borderTopColor:'#ffc107', borderRadius:'50%', animation:'spin 0.8s linear infinite', flexShrink:0 }} />
            <span style={{ fontSize:13, color:'#ffc107' }}>Aguardando confirmação do pagamento...</span>
          </div>
        )}
        {paymentStatus === 'rejected' && (
          <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:10, padding:'10px 12px', background:'rgba(229,57,53,0.08)', border:'1px solid rgba(229,57,53,0.3)', borderRadius:8 }}>
            <span style={{ fontSize:13, color:'#e53935' }}>Pagamento não foi aprovado. Gere um novo código Pix para tentar novamente.</span>
          </div>
        )}
      </>
    )}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:16, fontSize:13, color:'#888' }}>
              <input type="checkbox" id="ck-terms" checked={terms} onChange={e=>setTerms(e.target.checked)} style={{ accentColor:C.primary, width:14, height:14, flexShrink:0 }} />
              <label htmlFor="ck-terms" style={{ userSelect:'none' }}>Eu aceito os <span style={{ color:'#aaa', textDecoration:'underline', cursor:'pointer' }}>termos e condições</span> desta compra.</label>
            </div>

            <button
              disabled
              style={{
                width:'100%', marginTop:16,
                background: paymentStatus === 'approved' ? C.green : '#2a2a2a',
                color: paymentStatus === 'approved' ? '#fff' : '#555',
                border:'none', borderRadius:9, padding:'13px', fontSize:15, fontWeight:700,
                cursor:'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxSizing:'border-box'
              }}
            >
              <ShieldCheck size={16} />
              {paymentStatus === 'approved'
                ? 'Pagamento aprovado!'
                : paymentStatus === 'pending'
                  ? 'Aguardando pagamento...'
                  : 'Gere o Pix e pague para continuar'}
            </button>
          </div>
        </div>

        {/* RIGHT — Resumo do pedido */}
        <div style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:12, padding:20, alignSelf:'start', width: '100%', boxSizing: 'border-box', minWidth: 0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <p style={{ fontWeight:700, fontSize:15, color:'#fff' }}>Resumo do pedido</p>
            <div style={{ background:'#1e2e1e', border:'1px solid #2d4a2d', color:'#4caf6e', borderRadius:20, padding:'5px 12px', fontSize:12, display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap' }}><ShieldCheck size={12} /> Pagamento seguro</div>
          </div>

          {/* Item(ns) */}
          {isCartCheckout ? (
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16, maxHeight:220, overflowY:'auto' }}>
              {cartItems!.map(ci => (
                <div key={ci.cartId} style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:42, height:42, borderRadius:8, overflow:'hidden', flexShrink:0, background:'#0d1a2a' }}>
                    {ci.appId && (
                      <img src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${ci.appId}/header.jpg`} alt={ci.title}
                        style={{ width:'100%', height:'100%', objectFit:'cover' }}
                        onError={e=>{(e.target as HTMLImageElement).style.display='none'}} />
                    )}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{ci.title}</div>
                    <div style={{ fontSize:11, color:'#666', marginTop:2 }}>{ci.variantLabel || 'Edição Base'} · Qtd: {ci.quantity}</div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#fff', whiteSpace:'nowrap' }}>{fmt(parsePrice(ci.price) * ci.quantity)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
              <div style={{ width:50, height:50, borderRadius:8, overflow:'hidden', flexShrink:0, background:'#0d1a2a' }}>
                {coverUrl && <img src={coverUrl} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{(e.target as HTMLImageElement).style.display='none'}} />}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:700, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.title}</div>
                <div style={{ fontSize:11, color:'#666', marginTop:2 }}>{item.variants ? item.variants[0]?.label : 'Edição Base'}</div>
                <div style={{ fontSize:12, color:'#888', marginTop:1 }}>{item.price}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                <button onClick={() => setQty(q => Math.max(1, q-1))} style={{ width:26, height:26, borderRadius:5, background:'#2a2a2a', border:'none', color:'#fff', fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                <div style={{ width:30, height:26, background:'#2a2a2a', borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff' }}>{qty}</div>
                <button onClick={() => setQty(q => q+1)} style={{ width:26, height:26, borderRadius:5, background:'#2a2a2a', border:'none', color:'#fff', fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                <button onClick={() => setQty(1)} style={{ width:26, height:26, borderRadius:5, background:'#3a0a0a', border:'none', color:'#e44', fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
              </div>
              <div style={{ fontSize:14, fontWeight:700, color:'#fff', marginLeft:8, minWidth:60, textAlign:'right', whiteSpace:'nowrap' }}>{fmt(basePrice * qty)}</div>
            </div>
          )}

          {/* Coupon */}
          <div style={{ display:'flex', gap:8, marginBottom:4 }}>
            <input value={coupon} onChange={e=>{ setCoupon(e.target.value); setCouponMsg(''); }} placeholder="Digite seu cupom de desconto" style={{ flex:1, minWidth:0, background:'#111', border:'1px solid #2a2a2a', borderRadius:8, padding:'9px 12px', color:'#ccc', fontSize:13, outline:'none' }} />
            <button onClick={applyCoupon} disabled={couponLoading} style={{ background: couponLoading ? '#333' : '#222', border:'1px solid #333', borderRadius:8, color:'#ccc', fontSize:13, fontWeight:600, padding:'9px 16px', cursor: couponLoading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap', flexShrink:0 }}>
              {couponLoading ? '...' : 'Aplicar'}
            </button>
          </div>
          {couponMsg && (
            <p style={{ fontSize:12, marginBottom:12, color: discount > 0 ? '#4caf6e' : '#FF6B6B' }}>{couponMsg}</p>
          )}

          <div style={{ height:1, background:'#2a2a2a', margin:'4px 0 12px' }} />
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, color:'#aaa', marginBottom:6 }}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, color:'#aaa', marginBottom:10 }}><span>Descontos</span><span style={{ color: discount > 0 ? '#4caf6e' : '#aaa' }}>{fmt(discount)}</span></div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:16, fontWeight:700, color:'#fff' }}><span>Total</span><span>{fmt(total)}</span></div>
        </div>
      </div>
    </div>
  );
}
/* ═══════════════════════════════════════════════════════════
   CARRINHO — MODAL
═══════════════════════════════════════════════════════════ */
function CartModal({
  items, onClose, onRemove, onUpdateQuantity, onCheckout
}: {
  items: CartItem[];
  onClose: () => void;
  onRemove: (cartId: string) => void;
  onUpdateQuantity: (cartId: string, quantity: number) => void;
  onCheckout: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const total = items.reduce((sum, i) => sum + parsePriceStr(i.price) * i.quantity, 0);

  return (
    <div className="modal-overlay" onClick={onClose}
      style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'flex-end', padding:0 }}>
      <div onClick={e=>e.stopPropagation()}
        style={{ width:'100%', maxWidth:440, height:'100%', background:C.card, borderLeft:`1px solid ${C.border}`, display:'flex', flexDirection:'column', boxShadow:'-10px 0 40px rgba(0,0,0,0.5)' }}>

        {/* Header do painel */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'22px 24px', borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <ShoppingCart size={20} color={C.secondary} />
            <h2 style={{ fontSize:19, fontWeight:800, color:C.textLight }}>Meu Carrinho</h2>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:C.textMuted, cursor:'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Lista de itens */}
        <div style={{ flex:1, overflowY:'auto', padding: items.length ? '16px 20px' : '0' }}>
          {items.length === 0 ? (
            <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, padding:'0 30px', textAlign:'center' }}>
              <ShoppingCart size={42} color={C.textMuted} />
              <p style={{ color:C.textMuted, fontSize:15 }}>Seu carrinho está vazio.</p>
              <button onClick={onClose} style={{ marginTop:6, padding:'10px 22px', borderRadius:10, background:C.primary, border:'none', color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer' }}>
                Continuar comprando
              </button>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {items.map(ci => {
                const unitPrice = parsePriceStr(ci.price);
                const coverUrl = ci.appId
                  ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${ci.appId}/header.jpg`
                  : '';
                return (
                  <div key={ci.cartId} style={{ display:'flex', gap:12, background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:12 }}>
                    <div style={{ width:64, height:64, borderRadius:8, overflow:'hidden', flexShrink:0, background:'#0d1a2a' }}>
                      {coverUrl && (
                        <img src={coverUrl} alt={ci.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                          onError={e=>{(e.target as HTMLImageElement).style.display='none'}} />
                      )}
                    </div>
                    <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                      <div>
                        <p style={{ fontSize:14, fontWeight:700, color:C.textLight, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{ci.title}</p>
                        <p style={{ fontSize:11, color:C.textMuted, marginTop:2 }}>{ci.variantLabel || 'Edição Base'}</p>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:6 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <button onClick={() => onUpdateQuantity(ci.cartId, ci.quantity - 1)}
                            style={{ width:24, height:24, borderRadius:5, background:'#2a2a2a', border:'none', color:'#fff', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                          <div style={{ width:26, height:24, background:'#2a2a2a', borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff' }}>{ci.quantity}</div>
                          <button onClick={() => onUpdateQuantity(ci.cartId, ci.quantity + 1)}
                            style={{ width:24, height:24, borderRadius:5, background:'#2a2a2a', border:'none', color:'#fff', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                        </div>
                        <span style={{ fontSize:14, fontWeight:800, color:C.secondary }}>{formatPriceStr(unitPrice * ci.quantity)}</span>
                      </div>
                    </div>
                    <button onClick={() => onRemove(ci.cartId)}
                      style={{ alignSelf:'flex-start', background:'none', border:'none', color:C.textMuted, cursor:'pointer', padding:2, flexShrink:0 }}
                      title="Remover item">
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer com total e checkout */}
        {items.length > 0 && (
          <div style={{ borderTop:`1px solid ${C.border}`, padding:'18px 24px', flexShrink:0, background:C.card }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <span style={{ color:C.textMuted, fontSize:14 }}>Total</span>
              <span style={{ color:C.textLight, fontSize:20, fontWeight:800 }}>{formatPriceStr(total)}</span>
            </div>
            <button onClick={onCheckout}
              style={{ width:'100%', padding:'15px', borderRadius:10, background:`linear-gradient(135deg, ${C.primary}, ${C.secondary})`, border:'none', color:'#fff', fontWeight:700, fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:`0 4px 18px ${C.glow}` }}>
              <CreditCard size={18} /> Finalizar compra
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer style={{ background:C.surface, borderTop:`1px solid ${C.border}`, padding:'50px 24px 30px' }}>
      <div style={{ maxWidth:1400, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:36, marginBottom:36 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${C.primary},${C.secondary})`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="11" width="4" height="2" rx="1"/><path d="M8 11V8M15 13h2M17 11h2"/><circle cx="12" cy="12" r="10"/></svg>
            </div>
            <span style={{ fontSize:18, fontWeight:900, color:C.textLight }}>Neplim Store</span>
          </div>
          <p style={{ color:C.textMuted, fontSize:13, lineHeight:1.7, maxWidth:220 }}>A melhor loja de jogos Steam do Brasil. Preços imbatíveis e entrega imediata.</p>
        </div>
        <div>
          <h4 style={{ color:C.textLight, fontWeight:700, marginBottom:14 }}>Links</h4>
          {['Jogos','Suporte','Sobre Nós','Blog'].map(l=>(
            <div key={l} className="nav-link" style={{ color:C.textMuted, fontSize:14, marginBottom:9, cursor:'pointer', transition:'color 0.2s' }}>{l}</div>
          ))}
        </div>
        <div>
          <h4 style={{ color:C.textLight, fontWeight:700, marginBottom:14 }}>Pagamentos</h4>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {['PIX'].map(p=>(
              <span key={p} style={{ background:C.card, border:`1px solid ${C.border}`, padding:'6px 12px', borderRadius:8, fontSize:13, color:C.textMuted }}>{p}</span>
            ))}
          </div>
        </div>
        <div>
          <h4 style={{ color:C.textLight, fontWeight:700, marginBottom:14 }}>Comunidade</h4>
          <div style={{ display:'flex', gap:10 }}>
            <a href="https://discord.gg/ZqZSYv32xY" target="_blank" rel="noopener noreferrer"
              style={{ width:42, height:42, borderRadius:10, background:'#5865F2', display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none' }}>
              <svg width="20" height="16" viewBox="0 0 71 55" fill="white"><path d="M60.1 4.9A58.5 58.5 0 0 0 45.8.6a.2.2 0 0 0-.2.1c-.6 1.2-1.3 2.7-1.8 3.9a54.1 54.1 0 0 0-16.3 0 41 41 0 0 0-1.8-3.9.2.2 0 0 0-.2-.1A58.4 58.4 0 0 0 11 4.9a.2.2 0 0 0-.1.1C1.6 18.7-.9 32.2.3 45.5a.2.2 0 0 0 .1.1 58.8 58.8 0 0 0 17.7 9 .2.2 0 0 0 .2-.1 42.2 42.2 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4c.4-.3.7-.6 1.1-.9a.2.2 0 0 1 .2 0c11.5 5.3 24 5.3 35.3 0a.2.2 0 0 1 .2 0c.4.3.7.6 1.1.9a.2.2 0 0 1 0 .4 36 36 0 0 1-5.5 2.6.2.2 0 0 0-.1.3 47.4 47.4 0 0 0 3.6 5.9.2.2 0 0 0 .2 .1 58.7 58.7 0 0 0 17.8-9 .2.2 0 0 0 .1-.1c1.5-15.4-2.5-28.8-10.7-40.6a.2.2 0 0 0-.1-.1ZM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Z"/></svg>
            </a>
          </div>
        </div>
      </div>
      <div style={{ maxWidth:1400, margin:'0 auto', paddingTop:24, borderTop:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <p style={{ color:C.textMuted, fontSize:13 }}>© 2025 Neplim Store. Todos os direitos reservados.</p>
        <div style={{ display:'flex', gap:20 }}>
          {['Termos de Uso','Privacidade','Cookies'].map(t=>(
            <span key={t} style={{ color:C.textMuted, fontSize:13, cursor:'pointer' }}>{t}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════
   MINHAS COMPRAS
═══════════════════════════════════════════════════════════ */
interface Compra {
  id: string;
  id_pagamento: string;
  titulo_jogo: string;
  valor: number;
  status: string;
  chave?: string | null;
  steam_key?: string | null;
  support_code?: string | null;
  codigo_suporte?: string | null;
  mensagem_entrega?: string | null;
  delivery_type?: string | null;
  data: string;
}

function MyPurchasesModal({ token, onClose }: { token: string; onClose: () => void }) {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/minhas-compras`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.erro || 'Erro ao carregar compras.');
        }
        const data = await res.json();
        if (!cancelled) setCompras(data);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Erro ao carregar compras.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="modal-overlay" onClick={onClose}
      style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}
        style={{ width:'100%', maxWidth:560, maxHeight:'80vh', overflowY:'auto', background:C.card, border:`1px solid ${C.border}`, borderRadius:24, padding:32, position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:16, right:16, background:'none', border:'none', color:C.textMuted, cursor:'pointer' }}>
          <X size={20} />
        </button>

        <h2 style={{ fontSize:24, fontWeight:900, color:C.textLight, marginBottom:4 }}>Minhas Compras</h2>
        <p style={{ color:C.textMuted, fontSize:14, marginBottom:24 }}>Histórico de pedidos aprovados na sua conta.</p>

        {loading && <p style={{ color:C.textMuted, fontSize:14 }}>Carregando...</p>}
        {!loading && error && <p style={{ color:'#FF6B6B', fontSize:14 }}>{error}</p>}
        {!loading && !error && compras.length === 0 && (
          <p style={{ color:C.textMuted, fontSize:14 }}>Você ainda não fez nenhuma compra.</p>
        )}

        {!loading && !error && compras.length > 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {compras.slice().reverse().map(c => (
              <div key={c.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'16px 18px', display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
                  <div>
                    <p style={{ color:C.textLight, fontWeight:700, fontSize:15, marginBottom:4 }}>{c.titulo_jogo}</p>
                    <p style={{ color:C.textMuted, fontSize:12 }}>{new Date(c.data).toLocaleString('pt-BR')}</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ color:C.secondary, fontWeight:800, fontSize:15 }}>
                      {Number(c.valor).toLocaleString('pt-BR', { style:'currency', currency:'BRL' })}
                    </p>
                    <span style={{ fontSize:11, fontWeight:700, color:C.green, textTransform:'uppercase' }}>Aprovado</span>
                  </div>
                </div>
                {(() => {
                  const codigo = c.chave || c.steam_key || c.support_code || c.codigo_suporte;
                  const isTicket = c.delivery_type === 'manual_ticket';
                  if (!codigo) return null;
                  return (
                    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:9, padding:'10px 14px' }}>
                      <p style={{ color:C.textMuted, fontSize:11, marginBottom:6 }}>
                        {isTicket ? '🎫 Código de resgate — abra um ticket no Discord' : '🔑 Chave de ativação'}
                      </p>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                        <span style={{ fontFamily:'monospace', fontSize:13, fontWeight:700, color:C.accent, letterSpacing:'1px', wordBreak:'break-all' }}>{codigo}</span>
                        <button onClick={() => navigator.clipboard.writeText(codigo)}
                          style={{ background:C.primary, border:'none', color:'white', borderRadius:6, padding:'5px 12px', fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
                          Copiar
                        </button>
                      </div>
                      {isTicket && c.mensagem_entrega && (
                        <p style={{ color:C.textMuted, fontSize:11, marginTop:6 }}>{c.mensagem_entrega}</p>
                      )}
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ADMIN — MODAL DE CRIAR/EDITAR PRODUTO
═══════════════════════════════════════════════════════════ */
interface AdminProduct {
  id: number;
  appId?: number;
  title: string;
  price: string;
  originalPrice?: string;
  discount?: number;
  category: string;
  description?: string;
  active?: boolean;
}

function AdminProductFormModal({
  product, onClose, onSaved, adminToken
}: {
  product: AdminProduct | null; // null = criando novo
  onClose: () => void;
  onSaved: () => void;
  adminToken: string;
}) {
  const isEditing = !!product;
  const [title, setTitle] = useState(product?.title || '');
  const [price, setPrice] = useState(product?.price || '');
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice || '');
  const [discount, setDiscount] = useState(product?.discount ? String(product.discount) : '');
  const [appId, setAppId] = useState(product?.appId ? String(product.appId) : '');
  const [category, setCategory] = useState(product?.category || 'Ação');
  const [description, setDescription] = useState(product?.description || '');
  const [active, setActive] = useState(product?.active !== false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!title.trim() || !price.trim()) { setErr('Título e preço são obrigatórios.'); return; }

    const payload: any = {
      title: title.trim(),
      price: price.trim(),
      category,
      description: description.trim() || undefined,
      originalPrice: originalPrice.trim() || undefined,
      discount: discount ? Number(discount) : undefined,
      appId: appId ? Number(appId) : undefined,
      active
    };

    setLoading(true);
    try {
      const url = isEditing ? `${API_BASE}/admin/produtos/${product!.id}` : `${API_BASE}/admin/produtos`;
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.erro || 'Erro ao salvar produto.'); setLoading(false); return; }
      onSaved();
    } catch (error) {
      setErr('Não foi possível conectar ao servidor.');
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = { padding:'10px 14px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:14, outline:'none', width:'100%', boxSizing:'border-box' };
  const labelStyle: React.CSSProperties = { color:C.textMuted, fontSize:12, marginBottom:6, display:'block' };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = C.secondary;
    e.target.style.boxShadow = `0 0 0 3px rgba(123,47,190,0.15)`;
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = C.border;
    e.target.style.boxShadow = 'none';
  };

  return (
    <div onClick={onClose}
      style={{ position:'fixed', inset:0, zIndex:1700, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div onClick={e=>e.stopPropagation()}
        style={{ width:'100%', maxWidth:500, maxHeight:'88vh', overflowY:'auto', background:'linear-gradient(160deg, #0f0f1a 0%, #0a0a0f 100%)', border:`1px solid ${C.border}`, borderRadius:20, padding:0, position:'relative', boxShadow:`0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(123,47,190,0.15), inset 0 1px 0 rgba(255,255,255,0.04)`, animation:'adminFadeIn 0.25s ease' }}>

        {/* Cabeçalho do modal */}
        <div style={{ padding:'22px 24px 18px', borderBottom:`1px solid rgba(123,47,190,0.15)`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:`linear-gradient(135deg,${C.primary},${C.secondary})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>
              {isEditing ? '✏️' : '➕'}
            </div>
            <div>
              <h2 style={{ fontSize:16, fontWeight:800, color:C.textLight, margin:0 }}>{isEditing ? 'Editar Produto' : 'Novo Produto'}</h2>
              <p style={{ fontSize:11, color:C.textMuted, margin:0 }}>{isEditing ? `ID #${product?.id}` : 'Preencha os dados abaixo'}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.05)', border:`1px solid ${C.border}`, color:C.textMuted, cursor:'pointer', width:30, height:30, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.15s' }}
            onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.1)')}
            onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.05)')}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14, padding:'20px 24px 24px' }}>
          <div>
            <label style={labelStyle}>Título *</label>
            <input style={inputStyle} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex: Elden Ring" onFocus={focusStyle} onBlur={blurStyle} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <label style={labelStyle}>Preço atual *</label>
              <input style={inputStyle} value={price} onChange={e=>setPrice(e.target.value)} placeholder="R$ 29,90" onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            <div>
              <label style={labelStyle}>Preço original</label>
              <input style={inputStyle} value={originalPrice} onChange={e=>setOriginalPrice(e.target.value)} placeholder="R$ 199,90" onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <label style={labelStyle}>Desconto %</label>
              <input style={inputStyle} type="number" min="0" max="99" value={discount} onChange={e=>setDiscount(e.target.value)} placeholder="85" onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            <div>
              <label style={labelStyle}>Steam AppID</label>
              <input style={inputStyle} value={appId} onChange={e=>setAppId(e.target.value.replace(/\D/g,''))} placeholder="1245620" onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Categoria</label>
            <select style={inputStyle} value={category} onChange={e=>setCategory(e.target.value)} onFocus={focusStyle} onBlur={blurStyle}>
              {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Descrição</label>
            <textarea style={{ ...inputStyle, minHeight:70, resize:'vertical', fontFamily:'inherit' }} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Descrição curta do produto..." onFocus={focusStyle} onBlur={blurStyle} />
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(123,47,190,0.06)', border:`1px solid rgba(123,47,190,0.15)`, borderRadius:10, padding:'12px 14px' }}>
            <input type="checkbox" id="prod-active" checked={active} onChange={e=>setActive(e.target.checked)} style={{ accentColor:C.primary, width:15, height:15, cursor:'pointer' }} />
            <label htmlFor="prod-active" style={{ color:C.textMuted, fontSize:13, userSelect:'none', cursor:'pointer' }}>
              Produto <strong style={{ color: active ? C.green : '#FF6B6B' }}>{active ? 'ativo' : 'inativo'}</strong> — {active ? 'visível na loja' : 'oculto da loja'}
            </label>
          </div>

          {err && (
            <div style={{ background:'rgba(255,107,107,0.08)', border:'1px solid rgba(255,107,107,0.25)', borderRadius:9, padding:'10px 14px', color:'#FF6B6B', fontSize:13 }}>
              ⚠️ {err}
            </div>
          )}

          <div style={{ display:'flex', gap:10, marginTop:4 }}>
            <button type="button" onClick={onClose}
              style={{ flex:1, padding:'12px', borderRadius:10, background:'transparent', border:`1px solid ${C.border}`, color:C.textMuted, fontWeight:600, fontSize:14, cursor:'pointer', transition:'all 0.15s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.05)'; (e.currentTarget as HTMLButtonElement).style.color='#fff'}}
              onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background='transparent'; (e.currentTarget as HTMLButtonElement).style.color=C.textMuted}}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              style={{ flex:2, padding:'12px', borderRadius:10, background:`linear-gradient(135deg,${C.primary},${C.secondary})`, border:'none', color:'white', fontWeight:700, fontSize:14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow:`0 4px 16px rgba(123,47,190,0.4)`, transition:'opacity 0.15s, transform 0.15s' }}
              onMouseEnter={e=>{ if (!loading) (e.currentTarget as HTMLButtonElement).style.transform='translateY(-1px)' }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLButtonElement).style.transform='translateY(0)' }}>
              {loading ? '⏳ Salvando...' : isEditing ? '✓ Salvar alterações' : '✓ Criar produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ADMIN — MODAL DE CRIAR/EDITAR CUPOM DE DESCONTO
═══════════════════════════════════════════════════════════ */
function AdminCouponFormModal({
  coupon, products, onClose, onSaved, adminToken
}: {
  coupon: AdminCoupon | null; // null = criando novo
  products: AdminProduct[];   // lista de produtos para escolher quais aceitam o cupom
  onClose: () => void;
  onSaved: () => void;
  adminToken: string;
}) {
  const isEditing = !!coupon;
  const [codigo, setCodigo] = useState(coupon?.codigo || '');
  const [percentual, setPercentual] = useState(coupon ? String(coupon.percentual) : '');
  const [validoAte, setValidoAte] = useState(coupon?.validoAte ? coupon.validoAte.slice(0, 10) : '');
  const [usosMaximos, setUsosMaximos] = useState(coupon?.usosMaximos ? String(coupon.usosMaximos) : '');
  const [active, setActive] = useState(coupon?.active !== false);
  const [produtosSelecionados, setProdutosSelecionados] = useState<number[]>(coupon?.produtosAplicaveis || []);
  const [productSearch, setProductSearch] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleProduto = (id: number) => {
    setProdutosSelecionados(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const filteredProducts = products.filter(p => !productSearch || p.title.toLowerCase().includes(productSearch.toLowerCase()));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!codigo.trim() || !percentual.trim()) { setErr('Código e percentual de desconto são obrigatórios.'); return; }
    if (Number(percentual) <= 0 || Number(percentual) > 100) { setErr('O percentual deve ser entre 1 e 100.'); return; }
    if (produtosSelecionados.length === 0) { setErr('Selecione ao menos um produto para o cupom.'); return; }

    const payload: any = {
      codigo: codigo.trim(),
      percentual: Number(percentual),
      produtosAplicaveis: produtosSelecionados,
      validoAte: validoAte || null,
      usosMaximos: usosMaximos ? Number(usosMaximos) : null,
      active
    };

    setLoading(true);
    try {
      const url = isEditing ? `${API_BASE}/admin/cupons/${coupon!.id}` : `${API_BASE}/admin/cupons`;
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.erro || 'Erro ao salvar cupom.'); setLoading(false); return; }
      onSaved();
    } catch (error) {
      setErr('Não foi possível conectar ao servidor.');
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = { padding:'10px 14px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:14, outline:'none', width:'100%', boxSizing:'border-box' };
  const labelStyle: React.CSSProperties = { color:C.textMuted, fontSize:12, marginBottom:6, display:'block' };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = C.secondary;
    e.target.style.boxShadow = `0 0 0 3px rgba(123,47,190,0.15)`;
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = C.border;
    e.target.style.boxShadow = 'none';
  };

  return (
    <div onClick={onClose}
      style={{ position:'fixed', inset:0, zIndex:1700, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div onClick={e=>e.stopPropagation()}
        style={{ width:'100%', maxWidth:520, maxHeight:'88vh', overflowY:'auto', background:'linear-gradient(160deg, #0f0f1a 0%, #0a0a0f 100%)', border:`1px solid ${C.border}`, borderRadius:20, padding:0, position:'relative', boxShadow:`0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(123,47,190,0.15), inset 0 1px 0 rgba(255,255,255,0.04)`, animation:'adminFadeIn 0.25s ease' }}>

        {/* Cabeçalho do modal */}
        <div style={{ padding:'22px 24px 18px', borderBottom:`1px solid rgba(123,47,190,0.15)`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:`linear-gradient(135deg,${C.primary},${C.secondary})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>
              {isEditing ? '✏️' : '🎟️'}
            </div>
            <div>
              <h2 style={{ fontSize:16, fontWeight:800, color:C.textLight, margin:0 }}>{isEditing ? 'Editar Cupom' : 'Novo Cupom'}</h2>
              <p style={{ fontSize:11, color:C.textMuted, margin:0 }}>{isEditing ? `Código: ${coupon?.codigo}` : 'Preencha os dados abaixo'}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.05)', border:`1px solid ${C.border}`, color:C.textMuted, cursor:'pointer', width:30, height:30, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.15s' }}
            onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.1)')}
            onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.05)')}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14, padding:'20px 24px 24px' }}>
          <div>
            <label style={labelStyle}>Código do cupom *</label>
            <input style={{ ...inputStyle, textTransform:'uppercase' }} value={codigo} onChange={e=>setCodigo(e.target.value)} placeholder="Ex: PROMO10" onFocus={focusStyle} onBlur={blurStyle} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <label style={labelStyle}>Desconto (%) *</label>
              <input style={inputStyle} type="number" min="1" max="100" value={percentual} onChange={e=>setPercentual(e.target.value)} placeholder="10" onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            <div>
              <label style={labelStyle}>Limite de usos</label>
              <input style={inputStyle} type="number" min="1" value={usosMaximos} onChange={e=>setUsosMaximos(e.target.value.replace(/\D/g,''))} placeholder="Ilimitado" onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Válido até</label>
            <input style={inputStyle} type="date" value={validoAte} onChange={e=>setValidoAte(e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
            <p style={{ fontSize:11, color:C.textMuted, marginTop:5 }}>Deixe em branco para um cupom sem data de expiração.</p>
          </div>

          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
              <label style={{ ...labelStyle, margin:0 }}>Produtos aplicáveis * ({produtosSelecionados.length} selecionado{produtosSelecionados.length !== 1 ? 's' : ''})</label>
              <div style={{ display:'flex', gap:6 }}>
                <button type="button" onClick={() => setProdutosSelecionados(products.map(p => p.id))}
                  style={{ background:`linear-gradient(135deg,${C.primary},${C.secondary})`, border:'none', color:'white', borderRadius:6, padding:'4px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                  ✓ Todos os jogos
                </button>
                <button type="button" onClick={() => setProdutosSelecionados([])}
                  style={{ background:'rgba(255,107,107,0.15)', border:'1px solid rgba(255,107,107,0.3)', color:'#FF6B6B', borderRadius:6, padding:'4px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                  ✕ Limpar
                </button>
              </div>
            </div>
            <input value={productSearch} onChange={e=>setProductSearch(e.target.value)} placeholder="🔍  Buscar produto..."
              style={{ ...inputStyle, marginBottom:8 }} onFocus={focusStyle} onBlur={blurStyle} />
            <div style={{ maxHeight:180, overflowY:'auto', border:`1px solid ${C.border}`, borderRadius:8, background:C.surface }}>
              {filteredProducts.length === 0 && (
                <p style={{ color:C.textMuted, fontSize:12, padding:'14px', textAlign:'center' }}>Nenhum produto encontrado.</p>
              )}
              {filteredProducts.slice(0, 100).map(p => (
                <label key={p.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderBottom:`1px solid rgba(123,47,190,0.08)`, cursor:'pointer' }}>
                  <input type="checkbox" checked={produtosSelecionados.includes(p.id)} onChange={() => toggleProduto(p.id)} style={{ accentColor:C.primary, width:14, height:14, cursor:'pointer' }} />
                  <span style={{ color:C.textLight, fontSize:13, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</span>
                  <span style={{ color:C.secondary, fontSize:12, fontWeight:600 }}>{p.price}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(123,47,190,0.06)', border:`1px solid rgba(123,47,190,0.15)`, borderRadius:10, padding:'12px 14px' }}>
            <input type="checkbox" id="cupom-active" checked={active} onChange={e=>setActive(e.target.checked)} style={{ accentColor:C.primary, width:15, height:15, cursor:'pointer' }} />
            <label htmlFor="cupom-active" style={{ color:C.textMuted, fontSize:13, userSelect:'none', cursor:'pointer' }}>
              Cupom <strong style={{ color: active ? C.green : '#FF6B6B' }}>{active ? 'ativo' : 'inativo'}</strong> — {active ? 'pode ser usado no checkout' : 'bloqueado para uso'}
            </label>
          </div>

          {err && (
            <div style={{ background:'rgba(255,107,107,0.08)', border:'1px solid rgba(255,107,107,0.25)', borderRadius:9, padding:'10px 14px', color:'#FF6B6B', fontSize:13 }}>
              ⚠️ {err}
            </div>
          )}

          <div style={{ display:'flex', gap:10, marginTop:4 }}>
            <button type="button" onClick={onClose}
              style={{ flex:1, padding:'12px', borderRadius:10, background:'transparent', border:`1px solid ${C.border}`, color:C.textMuted, fontWeight:600, fontSize:14, cursor:'pointer', transition:'all 0.15s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.05)'; (e.currentTarget as HTMLButtonElement).style.color='#fff'}}
              onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background='transparent'; (e.currentTarget as HTMLButtonElement).style.color=C.textMuted}}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              style={{ flex:2, padding:'12px', borderRadius:10, background:`linear-gradient(135deg,${C.primary},${C.secondary})`, border:'none', color:'white', fontWeight:700, fontSize:14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow:`0 4px 16px rgba(123,47,190,0.4)`, transition:'opacity 0.15s, transform 0.15s' }}
              onMouseEnter={e=>{ if (!loading) (e.currentTarget as HTMLButtonElement).style.transform='translateY(-1px)' }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLButtonElement).style.transform='translateY(0)' }}>
              {loading ? '⏳ Salvando...' : isEditing ? '✓ Salvar alterações' : '✓ Criar cupom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ADMIN — PAINEL (Vendas, Estatísticas, Produtos)
═══════════════════════════════════════════════════════════ */
interface AdminSale {
  id: string;
  id_pagamento: string;
  email_usuario: string | null;
  nome_usuario: string | null;
  titulo_jogo: string;
  valor: number;
  metodo: string;
  status: string;
  chave?: string | null;
  steam_key?: string | null;
  support_code?: string | null;
  support_code_status?: string | null;
  delivery_type?: string | null;
  data: string;
}

interface AdminStats {
  totalVendido: number;
  totalVendas: number;
  ticketMedio: number;
  totalUsuarios: number;
  totalProdutos: number;
  produtosAtivos: number;
  vendasPorDia: { data: string; valor: number }[];
}

interface AdminCoupon {
  id: string;
  codigo: string;
  percentual: number;
  produtosAplicaveis: number[];
  validoParaTodos: boolean;
  validoAte: string | null;
  usosMaximos: number | null;
  usosAtuais: number;
  active: boolean;
  criadoEm: string;
}

function AdminPanel({ adminToken, onClose, onLogout }: { adminToken: string; onClose: () => void; onLogout: () => void }) {
  const [tab, setTab] = useState<'vendas' | 'estatisticas' | 'produtos' | 'cupons'>('estatisticas');

  const [sales, setSales] = useState<AdminSale[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loadingTab, setLoadingTab] = useState(false);
  const [errTab, setErrTab] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [massaPriceModal, setMassaPriceModal] = useState(false);
  const [massaValor, setMassaValor] = useState('');
  const [massaModo, setMassaModo] = useState<'fixo'|'percentual'>('fixo');
  const [massaLoading, setMassaLoading] = useState(false);
  const [massaMsg, setMassaMsg] = useState('');

  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);
  const [creatingCoupon, setCreatingCoupon] = useState(false);
  const [deletingCouponId, setDeletingCouponId] = useState<string | null>(null);

  const authHeaders = { Authorization: `Bearer ${adminToken}` };

  const handleAuthError = (res: Response) => {
    if (res.status === 401 || res.status === 403) {
      onLogout();
      return true;
    }
    return false;
  };

  const loadVendas = async () => {
    setLoadingTab(true); setErrTab('');
    try {
      const res = await fetch(`${API_BASE}/admin/vendas`, { headers: authHeaders });
      if (handleAuthError(res)) return;
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao carregar vendas.');
      setSales(data);
    } catch (e: any) {
      setErrTab(e.message || 'Erro ao carregar vendas.');
    } finally {
      setLoadingTab(false);
    }
  };

  const loadEstatisticas = async () => {
    setLoadingTab(true); setErrTab('');
    try {
      const res = await fetch(`${API_BASE}/admin/estatisticas`, { headers: authHeaders });
      if (handleAuthError(res)) return;
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao carregar estatísticas.');
      setStats(data);
    } catch (e: any) {
      setErrTab(e.message || 'Erro ao carregar estatísticas.');
    } finally {
      setLoadingTab(false);
    }
  };

  const loadProdutos = async () => {
    setLoadingTab(true); setErrTab('');
    try {
      const res = await fetch(`${API_BASE}/admin/produtos`, { headers: authHeaders });
      if (handleAuthError(res)) return;
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao carregar produtos.');
      setProducts(data);
    } catch (e: any) {
      setErrTab(e.message || 'Erro ao carregar produtos.');
    } finally {
      setLoadingTab(false);
    }
  };

  const loadCupons = async () => {
    setLoadingTab(true); setErrTab('');
    try {
      // Cupons referenciam produtos pelo ID, então garantimos que a lista de
      // produtos também esteja carregada (para mostrar nomes na tela e no formulário).
      const [resCupons, resProdutos] = await Promise.all([
        fetch(`${API_BASE}/admin/cupons`, { headers: authHeaders }),
        products.length === 0 ? fetch(`${API_BASE}/admin/produtos`, { headers: authHeaders }) : Promise.resolve(null)
      ]);
      if (handleAuthError(resCupons)) return;
      const dataCupons = await resCupons.json();
      if (!resCupons.ok) throw new Error(dataCupons.erro || 'Erro ao carregar cupons.');
      setCoupons(dataCupons);
      if (resProdutos) {
        const dataProdutos = await resProdutos.json();
        if (resProdutos.ok) setProducts(dataProdutos);
      }
    } catch (e: any) {
      setErrTab(e.message || 'Erro ao carregar cupons.');
    } finally {
      setLoadingTab(false);
    }
  };

  useEffect(() => {
    if (tab === 'vendas') loadVendas();
    else if (tab === 'estatisticas') loadEstatisticas();
    else if (tab === 'produtos') loadProdutos();
    else if (tab === 'cupons') loadCupons();
  }, [tab]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleMassaPrice = async () => {
    const v = parseFloat(massaValor.replace(',', '.'));
    if (isNaN(v) || massaValor.trim() === '') { setMassaMsg('Informe um valor válido.'); return; }
    if (massaModo === 'fixo' && v < 0) { setMassaMsg('O preço não pode ser negativo.'); return; }
    if (!confirm(`Aplicar ${massaModo === 'fixo' ? `preço fixo R$ ${v.toFixed(2).replace('.',',')}` : `ajuste de ${v > 0 ? '+' : ''}${v}%`} em TODOS os jogos?`)) return;
    setMassaLoading(true); setMassaMsg('');
    try {
      const res = await fetch(`${API_BASE}/admin/produtos/ajuste-em-massa`, {
        method: 'POST', headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ modo: massaModo, valor: v })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao ajustar preços.');
      setMassaMsg(`✓ ${data.mensagem}`);
      await loadProdutos();
      setTimeout(() => { setMassaPriceModal(false); setMassaValor(''); setMassaMsg(''); }, 1500);
    } catch (e: any) {
      setMassaMsg(e.message || 'Erro ao ajustar preços.');
    } finally {
      setMassaLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/admin/produtos/${id}`, { method: 'DELETE', headers: authHeaders });
      if (handleAuthError(res)) return;
      if (!res.ok) { const data = await res.json().catch(()=>({})); alert(data.erro || 'Erro ao remover produto.'); return; }
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch {
      alert('Não foi possível conectar ao servidor.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    setDeletingCouponId(id);
    try {
      const res = await fetch(`${API_BASE}/admin/cupons/${id}`, { method: 'DELETE', headers: authHeaders });
      if (handleAuthError(res)) return;
      if (!res.ok) { const data = await res.json().catch(()=>({})); alert(data.erro || 'Erro ao remover cupom.'); return; }
      setCoupons(prev => prev.filter(c => c.id !== id));
    } catch {
      alert('Não foi possível conectar ao servidor.');
    } finally {
      setDeletingCouponId(null);
    }
  };

  const fmtMoney = (v: number) => v.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });

  const filteredProducts = products.filter(p => !productSearch || p.title.toLowerCase().includes(productSearch.toLowerCase()));

  const maxDiaValor = stats ? Math.max(1, ...stats.vendasPorDia.map(d => d.valor)) : 1;

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1600, background:'#07070f', overflowY:'auto', fontFamily:'system-ui, sans-serif' }}>
      <style>{`
        @keyframes adminFadeIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes adminSlideIn { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
        @keyframes barGrow { from { height:0%; } to { height:var(--bar-h); } }
        @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes shimmer { from { background-position: -400px 0; } to { background-position: 400px 0; } }
        .adm-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .adm-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(123,47,190,0.22) !important; }
        .adm-tab { transition: all 0.18s ease; }
        .adm-tab:hover { color: #fff !important; background: rgba(123,47,190,0.1) !important; }
        .adm-row { transition: background 0.14s ease; }
        .adm-row:hover { background: rgba(123,47,190,0.07) !important; }
        .adm-btn-edit { transition: color 0.15s, background 0.15s; border-radius:6px; padding:4px 10px; }
        .adm-btn-edit:hover { color:#fff !important; background: rgba(199,125,255,0.15) !important; }
        .adm-btn-del { transition: color 0.15s, background 0.15s; border-radius:6px; padding:4px 10px; }
        .adm-btn-del:hover { color:#fff !important; background: rgba(255,107,107,0.15) !important; }
        .adm-logout:hover { background: rgba(255,255,255,0.06) !important; color: #fff !important; }
      `}</style>

      {/* Header */}
      <div style={{ position:'sticky', top:0, zIndex:10, background:'rgba(7,7,15,0.92)', backdropFilter:'blur(12px)', borderBottom:`1px solid ${C.border}`, padding:'14px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${C.primary},${C.secondary})`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 0 14px rgba(123,47,190,0.5)` }}>
            <ShieldCheck size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize:16, fontWeight:800, color:C.textLight, margin:0 }}>Painel Administrativo</h1>
            <p style={{ fontSize:11, color:C.textMuted, margin:0 }}>Neplim Store</p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(76,175,80,0.1)', border:'1px solid rgba(76,175,80,0.25)', borderRadius:20, padding:'5px 12px' }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:C.green, animation:'pulse-dot 2s ease-in-out infinite' }} />
            <span style={{ fontSize:12, color:C.green, fontWeight:600 }}>Online</span>
          </div>
          <button onClick={onLogout} className="adm-logout" style={{ background:'none', border:`1px solid ${C.border}`, color:C.textMuted, borderRadius:8, padding:'7px 14px', fontSize:13, cursor:'pointer', transition:'all 0.15s' }}>
            Sair
          </button>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:`1px solid ${C.border}`, color:'#aaa', width:34, height:34, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'background 0.15s' }}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, padding:'20px 28px 0', maxWidth:1200, margin:'0 auto' }}>
        {([
          ['estatisticas', '📊', 'Estatísticas'],
          ['vendas', '💸', 'Vendas'],
          ['produtos', '🎮', 'Produtos'],
          ['cupons', '🎟️', 'Cupons'],
        ] as const).map(([key, icon, label]) => (
          <button key={key} onClick={() => setTab(key)} className="adm-tab"
            style={{
              padding:'10px 20px', borderRadius:'12px 12px 0 0', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:7,
              background: tab === key ? C.card : 'transparent',
              color: tab === key ? C.textLight : C.textMuted,
              fontWeight: tab === key ? 700 : 500, fontSize:13,
              borderBottom: tab === key ? `2px solid ${C.secondary}` : '2px solid transparent',
              boxShadow: tab === key ? `0 -2px 12px rgba(123,47,190,0.1)` : 'none',
            }}>
            <span style={{ fontSize:15 }}>{icon}</span> {label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'28px', background:C.card, borderRadius:'0 12px 16px 16px', minHeight:400, animation:'adminFadeIn 0.3s ease' }}>
        {errTab && (
          <div style={{ background:'rgba(255,107,107,0.08)', border:'1px solid rgba(255,107,107,0.3)', borderRadius:10, padding:'12px 16px', marginBottom:20, color:'#FF6B6B', fontSize:13 }}>
            ⚠️ {errTab}
          </div>
        )}

        {loadingTab && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 0', gap:16 }}>
            <div style={{ width:36, height:36, border:`3px solid rgba(123,47,190,0.2)`, borderTopColor:C.secondary, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            <span style={{ color:C.textMuted, fontSize:14 }}>Carregando dados...</span>
          </div>
        )}

        {/* ───────── ESTATÍSTICAS ───────── */}
        {!loadingTab && tab === 'estatisticas' && stats && (
          <div style={{ animation:'adminFadeIn 0.3s ease' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:14, marginBottom:28 }}>
              {[
                { label:'Total vendido', value:fmtMoney(stats.totalVendido), color:C.secondary, icon:'💰' },
                { label:'Nº de vendas', value:String(stats.totalVendas), color:C.green, icon:'🛒' },
                { label:'Ticket médio', value:fmtMoney(stats.ticketMedio), color:C.accent, icon:'📈' },
                { label:'Usuários', value:String(stats.totalUsuarios), color:'#fff', icon:'👥' },
                { label:'Produtos ativos', value:`${stats.produtosAtivos}/${stats.totalProdutos}`, color:'#fff', icon:'🎮' },
              ].map(({ label, value, color, icon }, i) => (
                <div key={label} className="adm-card" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'18px 20px', animation:`adminSlideIn 0.3s ease ${i * 0.06}s both`, boxShadow:'0 2px 12px rgba(0,0,0,0.3)' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                    <p style={{ color:C.textMuted, fontSize:12, fontWeight:500 }}>{label}</p>
                    <span style={{ fontSize:18 }}>{icon}</span>
                  </div>
                  <p style={{ color, fontSize:22, fontWeight:800, letterSpacing:'-0.5px' }}>{value}</p>
                </div>
              ))}
            </div>

            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:'22px 24px' }}>
              <p style={{ color:C.textLight, fontWeight:700, fontSize:14, marginBottom:20 }}>📅 Vendas nos últimos 7 dias</p>
              <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:160 }}>
                {stats.vendasPorDia.map((d, i) => {
                  const heightPct = Math.max(4, (d.valor / maxDiaValor) * 100);
                  const dataObj = new Date(d.data + 'T00:00:00');
                  const diaLabel = dataObj.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' });
                  return (
                    <div key={d.data} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, height:'100%', justifyContent:'flex-end', animation:`adminSlideIn 0.3s ease ${i * 0.05}s both` }}>
                      <span style={{ fontSize:10, color:C.textMuted, textAlign:'center' }}>{d.valor > 0 ? fmtMoney(d.valor) : ''}</span>
                      <div style={{ width:'100%', maxWidth:36, height:`${heightPct}%`, background:`linear-gradient(180deg, ${C.secondary}, ${C.primary})`, borderRadius:'6px 6px 4px 4px', boxShadow:`0 0 10px rgba(123,47,190,0.35)`, transition:'height 0.4s ease' }} />
                      <span style={{ fontSize:10, color:C.textMuted }}>{diaLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ───────── VENDAS ───────── */}
        {!loadingTab && tab === 'vendas' && (
          <div style={{ animation:'adminFadeIn 0.3s ease' }}>
            {sales.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 0', color:C.textMuted }}>
                <div style={{ fontSize:40, marginBottom:12 }}>💸</div>
                <p style={{ fontSize:14 }}>Nenhuma venda registrada ainda.</p>
              </div>
            ) : (
              <div style={{ overflowX:'auto', borderRadius:12, border:`1px solid ${C.border}` }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                  <thead>
                    <tr style={{ background:'rgba(123,47,190,0.08)' }}>
                      {['Produto','Cliente','Valor','Método','Chave','Data'].map(h => (
                        <th key={h} style={{ padding:'12px 16px', color:C.textMuted, fontWeight:600, textAlign:'left', fontSize:12, textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((s, i) => (
                      <tr key={s.id} className="adm-row" style={{ borderBottom:`1px solid rgba(123,47,190,0.1)`, animation:`adminSlideIn 0.25s ease ${Math.min(i,10) * 0.04}s both` }}>
                        <td style={{ padding:'12px 16px', color:C.textLight, fontWeight:600 }}>{s.titulo_jogo}</td>
                        <td style={{ padding:'12px 16px', color:C.textMuted }}>{s.nome_usuario || s.email_usuario || '—'}</td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{ color:C.green, fontWeight:700, background:'rgba(76,175,80,0.1)', padding:'3px 9px', borderRadius:8, fontSize:12 }}>{fmtMoney(Number(s.valor))}</span>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{ color:C.secondary, background:'rgba(123,47,190,0.12)', padding:'3px 9px', borderRadius:8, fontSize:11, fontWeight:700, textTransform:'uppercase' }}>{s.metodo}</span>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          {(() => { const k = s.chave || s.steam_key || s.support_code; return k
                            ? <span style={{ fontFamily:'monospace', fontSize:12, color:C.accent, background:'rgba(123,47,190,0.12)', padding:'4px 10px', borderRadius:6, letterSpacing:'1px', wordBreak:'break-all' }}>{k}</span>
                            : <span style={{ color:C.textMuted, fontSize:12 }}>—</span>; })()}
                        </td>
                        <td style={{ padding:'12px 16px', color:C.textMuted, fontSize:12 }}>{new Date(s.data).toLocaleString('pt-BR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ───────── PRODUTOS ───────── */}
        {!loadingTab && tab === 'produtos' && (
          <div style={{ animation:'adminFadeIn 0.3s ease' }}>
            <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
              <input value={productSearch} onChange={e=>setProductSearch(e.target.value)} placeholder="🔍  Buscar produto..."
                style={{ flex:1, minWidth:200, padding:'10px 16px', background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:14, outline:'none', transition:'border-color 0.2s' }}
                onFocus={e=>(e.target.style.borderColor=C.secondary)}
                onBlur={e=>(e.target.style.borderColor=C.border)}
              />
              <button onClick={() => { setMassaPriceModal(true); setMassaMsg(''); setMassaValor(''); }}
                style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 20px', borderRadius:10, background:'rgba(123,47,190,0.15)', border:`1px solid rgba(123,47,190,0.35)`, color:C.secondary, fontWeight:700, fontSize:14, cursor:'pointer', transition:'opacity 0.15s, transform 0.15s' }}
                onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.transform='translateY(-1px)'}}
                onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.transform='translateY(0)'}}>
                💰 Preço em massa
              </button>
              <button onClick={() => setCreatingProduct(true)}
                style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 20px', borderRadius:10, background:`linear-gradient(135deg,${C.primary},${C.secondary})`, border:'none', color:'white', fontWeight:700, fontSize:14, cursor:'pointer', boxShadow:`0 4px 14px rgba(123,47,190,0.4)`, transition:'opacity 0.15s, transform 0.15s' }}
                onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.transform='translateY(-1px)'}}
                onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.transform='translateY(0)'}}>
                <Plus size={16} /> Novo produto
              </button>

              {/* Modal de Preço em Massa */}
              {massaPriceModal && (
                <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center' }}
                  onClick={e => { if (e.target === e.currentTarget) setMassaPriceModal(false); }}>
                  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:28, width:'100%', maxWidth:400 }}>
                    <h3 style={{ color:C.textLight, fontWeight:800, fontSize:17, marginBottom:4 }}>💰 Aplicar preço em todos os jogos</h3>
                    <p style={{ color:C.textMuted, fontSize:12, marginBottom:20 }}>Isso vai atualizar o preço de <b style={{color:C.secondary}}>todos os produtos</b> de uma vez.</p>

                    <label style={{ color:C.textMuted, fontSize:12, fontWeight:600, display:'block', marginBottom:6 }}>Modo</label>
                    <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                      {(['fixo','percentual'] as const).map(m => (
                        <button key={m} onClick={() => setMassaModo(m)}
                          style={{ flex:1, padding:'9px 0', borderRadius:9, border:`1px solid ${massaModo===m ? C.secondary : C.border}`, background: massaModo===m ? 'rgba(123,47,190,0.18)' : C.surface, color: massaModo===m ? C.secondary : C.textMuted, fontWeight:700, fontSize:13, cursor:'pointer' }}>
                          {m === 'fixo' ? '💵 Preço fixo' : '📊 Percentual'}
                        </button>
                      ))}
                    </div>

                    <label style={{ color:C.textMuted, fontSize:12, fontWeight:600, display:'block', marginBottom:6 }}>
                      {massaModo === 'fixo' ? 'Novo preço (R$)' : 'Ajuste (ex: -10 para -10%, +20 para +20%)'}
                    </label>
                    <input value={massaValor} onChange={e => { setMassaValor(e.target.value); setMassaMsg(''); }}
                      placeholder={massaModo === 'fixo' ? 'Ex: 49,90' : 'Ex: -10'}
                      style={{ width:'100%', boxSizing:'border-box', background:C.surface, border:`1px solid ${C.border}`, borderRadius:9, padding:'10px 14px', color:C.text, fontSize:14, outline:'none', marginBottom:16 }} />

                    {massaMsg && (
                      <p style={{ fontSize:12, marginBottom:12, color: massaMsg.startsWith('✓') ? '#4caf6e' : '#FF6B6B' }}>{massaMsg}</p>
                    )}

                    <div style={{ display:'flex', gap:10 }}>
                      <button onClick={() => setMassaPriceModal(false)}
                        style={{ flex:1, padding:'11px 0', borderRadius:9, background:C.surface, border:`1px solid ${C.border}`, color:C.textMuted, fontWeight:700, fontSize:14, cursor:'pointer' }}>
                        Cancelar
                      </button>
                      <button onClick={handleMassaPrice} disabled={massaLoading}
                        style={{ flex:2, padding:'11px 0', borderRadius:9, background:`linear-gradient(135deg,${C.primary},${C.secondary})`, border:'none', color:'white', fontWeight:700, fontSize:14, cursor: massaLoading ? 'not-allowed' : 'pointer', opacity: massaLoading ? 0.7 : 1 }}>
                        {massaLoading ? 'Aplicando...' : 'Aplicar em todos'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ overflowX:'auto', borderRadius:12, border:`1px solid ${C.border}` }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr style={{ background:'rgba(123,47,190,0.08)' }}>
                    {['Título','Categoria','Preço','Status','Ações'].map(h => (
                      <th key={h} style={{ padding:'12px 16px', color:C.textMuted, fontWeight:600, textAlign:'left', fontSize:12, textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.slice(0, 200).map((p, i) => (
                    <tr key={p.id} className="adm-row" style={{ borderBottom:`1px solid rgba(123,47,190,0.1)`, animation:`adminSlideIn 0.25s ease ${Math.min(i,10) * 0.03}s both` }}>
                      <td style={{ padding:'12px 16px', color:C.textLight, fontWeight:600, maxWidth:260, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</td>
                      <td style={{ padding:'12px 16px', color:C.textMuted, fontSize:12 }}>{p.category}</td>
                      <td style={{ padding:'12px 16px', color:C.secondary, fontWeight:700 }}>{p.price}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, background: p.active !== false ? 'rgba(76,175,80,0.12)' : 'rgba(255,107,107,0.12)', color: p.active !== false ? C.green : '#FF6B6B', border: `1px solid ${p.active !== false ? 'rgba(76,175,80,0.25)' : 'rgba(255,107,107,0.25)'}` }}>
                          {p.active !== false ? '● Ativo' : '● Inativo'}
                        </span>
                      </td>
                      <td style={{ padding:'12px 16px', whiteSpace:'nowrap' }}>
                        <button onClick={() => setEditingProduct(p)} className="adm-btn-edit" style={{ background:'none', border:'none', color:C.secondary, cursor:'pointer', fontSize:12, fontWeight:600, marginRight:6 }}>
                          Editar
                        </button>
                        <button onClick={() => { if (confirm(`Remover "${p.title}"?`)) handleDeleteProduct(p.id); }} disabled={deletingId === p.id} className="adm-btn-del"
                          style={{ background:'none', border:'none', color:'#FF6B6B', cursor: deletingId===p.id ? 'not-allowed' : 'pointer', fontSize:12, fontWeight:600, opacity: deletingId===p.id ? 0.5 : 1 }}>
                          {deletingId === p.id ? '...' : 'Remover'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProducts.length > 200 && (
                <p style={{ color:C.textMuted, fontSize:12, padding:'12px 16px', textAlign:'center' }}>
                  Mostrando 200 de {filteredProducts.length} produtos. Refine a busca para ver outros.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ───────── CUPONS ───────── */}
        {!loadingTab && tab === 'cupons' && (
          <div style={{ animation:'adminFadeIn 0.3s ease' }}>
            <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap', justifyContent:'flex-end' }}>
              <button onClick={() => setCreatingCoupon(true)}
                style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 20px', borderRadius:10, background:`linear-gradient(135deg,${C.primary},${C.secondary})`, border:'none', color:'white', fontWeight:700, fontSize:14, cursor:'pointer', boxShadow:`0 4px 14px rgba(123,47,190,0.4)`, transition:'opacity 0.15s, transform 0.15s' }}
                onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.transform='translateY(-1px)'}}
                onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.transform='translateY(0)'}}>
                <Plus size={16} /> Criar cupom
              </button>
            </div>

            {coupons.length === 0 && (
              <div style={{ textAlign:'center', padding:'60px 20px', color:C.textMuted }}>
                <p style={{ fontSize:32, marginBottom:10 }}>🎟️</p>
                <p style={{ fontSize:14 }}>Nenhum cupom criado ainda.</p>
              </div>
            )}

            {coupons.length > 0 && (
              <div style={{ overflowX:'auto', borderRadius:12, border:`1px solid ${C.border}` }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                  <thead>
                    <tr style={{ background:'rgba(123,47,190,0.08)' }}>
                      {['Código','Desconto','Produtos','Validade','Usos','Status','Ações'].map(h => (
                        <th key={h} style={{ padding:'12px 16px', color:C.textMuted, fontWeight:600, textAlign:'left', fontSize:12, textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c, i) => {
                      const expirado = c.validoAte ? new Date(c.validoAte) < new Date() : false;
                      const esgotado = c.usosMaximos !== null && c.usosAtuais >= c.usosMaximos;
                      const statusInativo = c.active === false || expirado || esgotado;
                      let statusLabel = '● Ativo';
                      if (c.active === false) statusLabel = '● Inativo';
                      else if (expirado) statusLabel = '● Expirado';
                      else if (esgotado) statusLabel = '● Esgotado';
                      return (
                        <tr key={c.id} className="adm-row" style={{ borderBottom:`1px solid rgba(123,47,190,0.1)`, animation:`adminSlideIn 0.25s ease ${Math.min(i,10) * 0.03}s both` }}>
                          <td style={{ padding:'12px 16px', color:C.textLight, fontWeight:700, letterSpacing:'0.5px' }}>{c.codigo}</td>
                          <td style={{ padding:'12px 16px', color:C.secondary, fontWeight:700 }}>{c.percentual}%</td>
                          <td style={{ padding:'12px 16px', color:C.textMuted, fontSize:12 }}>{c.produtosAplicaveis.length} produto{c.produtosAplicaveis.length !== 1 ? 's' : ''}</td>
                          <td style={{ padding:'12px 16px', color:C.textMuted, fontSize:12 }}>
                            {c.validoAte ? new Date(c.validoAte + 'T00:00:00').toLocaleDateString('pt-BR') : 'Sem expiração'}
                          </td>
                          <td style={{ padding:'12px 16px', color:C.textMuted, fontSize:12 }}>
                            {c.usosAtuais}{c.usosMaximos !== null ? ` / ${c.usosMaximos}` : ''}
                          </td>
                          <td style={{ padding:'12px 16px' }}>
                            <span style={{ fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, background: !statusInativo ? 'rgba(76,175,80,0.12)' : 'rgba(255,107,107,0.12)', color: !statusInativo ? C.green : '#FF6B6B', border: `1px solid ${!statusInativo ? 'rgba(76,175,80,0.25)' : 'rgba(255,107,107,0.25)'}` }}>
                              {statusLabel}
                            </span>
                          </td>
                          <td style={{ padding:'12px 16px', whiteSpace:'nowrap' }}>
                            <button onClick={() => setEditingCoupon(c)} className="adm-btn-edit" style={{ background:'none', border:'none', color:C.secondary, cursor:'pointer', fontSize:12, fontWeight:600, marginRight:6 }}>
                              Editar
                            </button>
                            <button onClick={() => { if (confirm(`Remover o cupom "${c.codigo}"?`)) handleDeleteCoupon(c.id); }} disabled={deletingCouponId === c.id} className="adm-btn-del"
                              style={{ background:'none', border:'none', color:'#FF6B6B', cursor: deletingCouponId===c.id ? 'not-allowed' : 'pointer', fontSize:12, fontWeight:600, opacity: deletingCouponId===c.id ? 0.5 : 1 }}>
                              {deletingCouponId === c.id ? '...' : 'Remover'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {creatingProduct && (
        <AdminProductFormModal
          product={null}
          adminToken={adminToken}
          onClose={() => setCreatingProduct(false)}
          onSaved={() => { setCreatingProduct(false); loadProdutos(); }}
        />
      )}
      {editingProduct && (
        <AdminProductFormModal
          product={editingProduct}
          adminToken={adminToken}
          onClose={() => setEditingProduct(null)}
          onSaved={() => { setEditingProduct(null); loadProdutos(); }}
        />
      )}
      {creatingCoupon && (
        <AdminCouponFormModal
          coupon={null}
          products={products}
          adminToken={adminToken}
          onClose={() => setCreatingCoupon(false)}
          onSaved={() => { setCreatingCoupon(false); loadCupons(); }}
        />
      )}
      {editingCoupon && (
        <AdminCouponFormModal
          coupon={editingCoupon}
          products={products}
          adminToken={adminToken}
          onClose={() => setEditingCoupon(null)}
          onSaved={() => { setEditingCoupon(null); loadCupons(); }}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════════ */
export default function NeplimStore() {
  useGlobalStyles();
  const cart = useCart();

  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [token, setToken] = useState('');
  const [showPurchases, setShowPurchases] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [productItem, setProductItem] = useState<PurchaseItem | null>(null);
  const [checkoutItem, setCheckoutItem] = useState<PurchaseItem | null>(null);
  const [checkoutFromCart, setCheckoutFromCart] = useState(false);

  // Admin: token completamente separado do token de cliente, com sua própria
  // chave no localStorage. Não tem relação nenhuma com isLoggedIn/token acima.
  const [adminToken, setAdminToken] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    const savedAdminToken = localStorage.getItem('neplim_admin_token');
    if (savedAdminToken) {
      setAdminToken(savedAdminToken);
      setShowAdminPanel(true);
    }
  }, []);

  const handleAdminLogin = (tok: string) => {
    // Só uma sessão por vez: logar como admin derruba qualquer sessão de cliente ativa.
    setIsLoggedIn(false);
    setUsername('');
    setAccountEmail('');
    setToken('');
    localStorage.removeItem('neplim_token');
    localStorage.removeItem('neplim_user');
    localStorage.removeItem('neplim_email');

    setAdminToken(tok);
    localStorage.setItem('neplim_admin_token', tok);
    setShowLogin(false); // fecha o modal de login (era ali que o admin entrou)
    setShowAdminPanel(true); // vai direto pro painel
  };

  useEffect(() => {
    // Se já existe sessão de admin salva, ela tem prioridade — não restaura sessão de cliente.
    const savedAdminTokenCheck = localStorage.getItem('neplim_admin_token');
    if (savedAdminTokenCheck) return;

    const savedToken = localStorage.getItem('neplim_token');
    const savedUser = localStorage.getItem('neplim_user');
    const savedEmail = localStorage.getItem('neplim_email');
    if (savedToken && savedUser && savedEmail) {
      setToken(savedToken);
      setUsername(savedUser);
      setAccountEmail(savedEmail);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (user: string, emailAddr: string, tok: string) => {
    // Só uma sessão por vez: logar como cliente derruba qualquer sessão admin ativa.
    setAdminToken('');
    localStorage.removeItem('neplim_admin_token');
    setShowAdminPanel(false);

    setIsLoggedIn(true);
    setUsername(user);
    setAccountEmail(emailAddr);
    setToken(tok);
    localStorage.setItem('neplim_token', tok);
    localStorage.setItem('neplim_user', user);
    localStorage.setItem('neplim_email', emailAddr);
    setShowLogin(false);
  };
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setAccountEmail('');
    setToken('');
    localStorage.removeItem('neplim_token');
    localStorage.removeItem('neplim_user');
    localStorage.removeItem('neplim_email');
  };

  const openProduct = (item: PurchaseItem) => {
    if (!isLoggedIn) { setShowLogin(true); return; }
    setProductItem(item);
  };

  // Ao confirmar a edição escolhida no ProductPageModal, fecha esse modal
  // e abre o Checkout. O Checkout é quem gera o Pix e mostra o QR Code.
  const handleConfirmPurchase = (item: any, variantLabel: string) => {
    setProductItem(null); // fecha a tela de produto
    setCheckoutFromCart(false);
    setCheckoutItem({
      ...item,
      variants: variantLabel ? [{ label: variantLabel, price: item.price, stock: 999 }] : item.variants
    }); // abre o checkout
  };

  // "Adicionar ao carrinho" dentro da página do produto: exige login,
  // adiciona o item e mantém a página de produto aberta (com feedback visual).
  const handleAddToCart = (item: any, variantLabel: string) => {
    if (!isLoggedIn) { setShowLogin(true); return; }
    cart.addToCart(
      { id: (item as any).id, title: item.title, price: item.price, originalPrice: item.originalPrice, discount: item.discount, appId: item.appId, variants: item.variants },
      variantLabel
    );
  };

  // Abre o checkout consolidado a partir do carrinho (vários produtos de uma vez)
  const handleCartCheckout = () => {
    if (!isLoggedIn) { setShowLogin(true); return; }
    setShowCart(false);
    setCheckoutFromCart(true);
    setCheckoutItem({ title: '', price: 'R$ 0,00' }); // placeholder; o CheckoutModal usa cartItems quando isCartCheckout
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'#000000', position:'relative' }}>
      <div style={{ position:'fixed', top:0, left:0, right:0, height:'100vh', pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
        <div className="purple-orb" style={{ position:'absolute', top:'-20%', left:'-10%', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, rgba(123,47,190,0.12) 0%, transparent 65%)' }} />
        <div className="purple-orb" style={{ position:'absolute', top:'30%', right:'-15%', width:800, height:800, borderRadius:'50%', background:'radial-gradient(circle, rgba(157,78,221,0.08) 0%, transparent 65%)', animationDelay:'2.5s' }} />
        <div className="purple-orb" style={{ position:'absolute', bottom:'-10%', left:'30%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(123,47,190,0.1) 0%, transparent 65%)', animationDelay:'1.2s' }} />
        {[...Array(12)].map((_,i) => (
          <div key={i} style={{
            position:'absolute',
            width: `${4 + (i % 4) * 3}px`,
            height: `${4 + (i % 4) * 3}px`,
            borderRadius:'50%',
            background: i % 3 === 0 ? 'rgba(199,125,255,0.6)' : i % 3 === 1 ? 'rgba(123,47,190,0.5)' : 'rgba(255,255,255,0.3)',
            left: `${8 + (i * 7.5) % 85}%`,
            top: `${10 + (i * 13) % 75}%`,
            animation: `particleFloat ${3 + (i % 4)}s ease-in-out infinite`,
            animationDelay: `${(i * 0.4) % 3}s`,
            pointerEvents:'none',
            filter:'blur(1px)',
            zIndex:0
          }} />
        ))}
      </div>

      <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', minHeight:'100vh' }}>
        <Header onLoginClick={() => setShowLogin(true)} isLoggedIn={isLoggedIn} username={username} onLogout={handleLogout} searchQuery={search} onSearch={setSearch} onMinhasCompras={() => setShowPurchases(true)} onConfiguracoes={() => setShowSettings(true)} onCartClick={() => setShowCart(true)} cartCount={cart.totalItems} />

        <main style={{ flex:1 }}>
          <HeroSlider onBuy={g => {
            const jogo = ALL_GAMES.find(j => j.title.toLowerCase() === g.title.toLowerCase() || j.appId === g.appId);
            if (jogo) openProduct({ id:jogo.id, title:jogo.title, price:jogo.price, originalPrice:jogo.originalPrice, discount:jogo.discount, appId:jogo.appId, variants:jogo.variants });
            else openProduct({ title:g.title, price:g.price, appId:g.appId });
          }} />
          <CategoriesSection selected={category} onSelect={setCategory} />
          <GamesGrid category={category} search={search}
            onGame={g => openProduct({ id:g.id, title:g.title, price:g.price, originalPrice:g.originalPrice, discount:g.discount, appId:g.appId, variants:g.variants })}
          />
        </main>

        <Footer />

        {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} onAdminLogin={handleAdminLogin} />}

        {adminToken && (
          <AdminPanel
            adminToken={adminToken}
            onClose={() => {
              setAdminToken('');
              localStorage.removeItem('neplim_admin_token');
              setShowAdminPanel(false);
            }}
            onLogout={() => {
              setAdminToken('');
              localStorage.removeItem('neplim_admin_token');
              setShowAdminPanel(false);
            }}
          />
        )}
        {productItem && (
          <ProductPageModal
            item={productItem}
            onClose={() => setProductItem(null)}
            onConfirm={handleConfirmPurchase}
            onAddToCart={handleAddToCart}
          />
        )}
        {checkoutItem && (
          <CheckoutModal
            item={checkoutItem}
            cartItems={checkoutFromCart ? cart.items : undefined}
            onClose={() => { setCheckoutItem(null); setCheckoutFromCart(false); }}
            accountEmail={accountEmail}
            accountName={username}
            onCheckoutSuccess={() => { if (checkoutFromCart) cart.clearCart(); }}
          />
        )}
        {showCart && (
          <CartModal
            items={cart.items}
            onClose={() => setShowCart(false)}
            onRemove={cart.removeFromCart}
            onUpdateQuantity={cart.updateQuantity}
            onCheckout={handleCartCheckout}
          />
        )}
        {showPurchases && <MyPurchasesModal token={token} onClose={() => setShowPurchases(false)} />}
        {showSettings && (
          <SettingsModal
            token={token}
            username={username}
            accountEmail={accountEmail}
            onClose={() => setShowSettings(false)}
            onLogout={handleLogout}
          />
        )}
      </div>
    </div>
    
  );
}
/* ═══════════════════════════════════════════════════════════
   COMPONENTE DO MODAL PIX (TEMA NEPLIM STORE)
═══════════════════════════════════════════════════════════ */
interface PixModalProps {
  qrCodeBase64: string;
  copiaECola: string;
  ticketUrl: string;
  onClose: () => void;
}

const PixModal: React.FC<PixModalProps> = ({ qrCodeBase64, copiaECola, ticketUrl, onClose }) => {
  const [copiado, setCopiado] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(copiaECola);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
    }}>
      <div style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: '12px', padding: '30px', maxWidth: '420px',
        width: '100%', textAlign: 'center', position: 'relative',
        boxShadow: `0 0 20px ${C.glow}`
      }}>
        {/* Botão Fechar usando o seu ícone X */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '15px', right: '15px',
          background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer'
        }}>
          <X size={24} />
        </button>

        <h3 style={{ color: C.textLight, marginBottom: '10px', fontSize: '22px' }}>
          Pague com <span style={{ color: C.primary, fontWeight: 'bold' }}>Pix</span>
        </h3>
        <p style={{ color: C.textMuted, fontSize: '14px', marginBottom: '20px' }}>
          Abra o app do seu banco e escaneie o código abaixo:
        </p>

        {/* Box da Foto do QR Code */}
        <div style={{
          background: '#FFFFFF', padding: '15px', borderRadius: '8px',
          display: 'inline-block', marginBottom: '20px'
        }}>
          <img 
            src={`data:image/jpeg;base64,${qrCodeBase64}`} 
            alt="QR Code Pix" 
            style={{ width: '220px', height: '220px', display: 'block' }}
          />
        </div>

        {/* Input Copia e Cola */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: C.textLight, fontSize: '14px', marginBottom: '8px', textAlign: 'left' }}>
            Código Copia e Cola:
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              readOnly 
              value={copiaECola} 
              style={{
                flex: 1, background: '#0a0a0a', border: `1px solid ${C.border}`,
                borderRadius: '6px', padding: '10px', color: C.accent, fontSize: '12px'
              }}
            />
            <button 
              onClick={handleCopy} 
              style={{
                background: C.primary, color: '#FFF', border: 'none',
                borderRadius: '6px', padding: '0 15px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              {copiado ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        <a href={ticketUrl} target="_blank" rel="noreferrer" style={{
          color: C.secondary, fontSize: '13px', textDecoration: 'underline', display: 'block'
        }}>
          Pagar no site do Mercado Pago
        </a>
      </div>
    </div>
  );
};
