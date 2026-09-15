// First fitting sample, using the existing Warrior T4 catalog. No stat changes.
export const CHITIN_SAMPLE_ITEMS=Object.freeze({head:'Chitin Armor Helmet',chest:'Chitin Armor Pauldron',legs:'Chitin Armor Pads',gauntlets:'Chitin Armor Gauntlet',boots:'Chitin Armor Boots'});
export const CHITIN_SAMPLE_REGIONS={
 head:'M75,50L279,50L279,205L243,224L155,206L147,156L75,155Z',
 chest:'M25,138L140,138L155,206L243,224L279,205L336,202L342,338L281,366L223,352L132,376L33,357Z',
 gauntlets:'M81,279L112,278L149,296L178,302L188,296L209,304L217,321L207,339L184,346L156,330L129,326L91,311L80,295ZM257,219L279,223L294,242L291,259L311,278L321,296L308,311L291,307L276,280L260,262L248,244Z',
 legs:'M0,355L132,376L223,352L281,366L418,355L418,627L0,627Z',
 boots:'M15,488L64,505L127,535L121,571L121,627L0,627ZM293,486L383,482L415,575L415,627L266,627L271,541Z',
};
export function armorSampleParts(player,appearance){
 if(player?.class!=='warrior'||appearance?.atlasKey!=='warrior-4')return [];
 return Object.entries(CHITIN_SAMPLE_ITEMS).filter(([slot,name])=>player.equipped?.[slot]?.name===name).map(([slot])=>({slot,path:CHITIN_SAMPLE_REGIONS[slot]}));
}
