import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PLAYER_AVATARS} from '../src/data/avatars.js';
import {AVATAR_FRAMES} from '../src/data/avatarFrames.js';
import {avatarPrice,ownsCosmetic,selectCosmetic} from '../src/utils/avatarCosmetics.js';
test('exactly the final 12 portraits and all 16 unique frames cost 250',()=>{
 assert.equal(PLAYER_AVATARS.filter(a=>avatarPrice(a)===250).length,12);
 assert.ok(PLAYER_AVATARS.slice(0,24).every(a=>avatarPrice(a)===0));
 assert.equal(AVATAR_FRAMES.length,16);assert.ok(AVATAR_FRAMES.every(f=>f.price===250));
 assert.equal(new Set(AVATAR_FRAMES.map(f=>f.crown+f.sides)).size,16);
});
test('cosmetic purchase, repeat equip, insufficient funds and reload preserve balance and gameplay',()=>{
 const original={diamonds:500,inventory:[{id:'keep'}],equipped:{mainHand:{atk:50}},avatarId:'human-warrior'};
 let p=selectCosmetic(original,'avatar','pixel-dwarf');assert.equal(p.diamonds,250);
 p=selectCosmetic(p,'avatar','pixel-dwarf');assert.equal(p.diamonds,250);
 p=selectCosmetic(p,'frame','sun');assert.equal(p.diamonds,0);
 assert.deepEqual(p.inventory,original.inventory);assert.deepEqual(p.equipped,original.equipped);assert.equal(original.diamonds,500);
 assert.equal(selectCosmetic(p,'avatar','paint-dragon'),p);assert.equal(selectCosmetic(p,'frame','frost'),p);
 p=JSON.parse(JSON.stringify(p));assert.ok(ownsCosmetic(p,'frame','sun'));assert.ok(ownsCosmetic(p,'avatar','pixel-dwarf'));
 p=selectCosmetic(p,'frame',null);p=selectCosmetic(p,'avatar','human-mage');
 p=selectCosmetic(p,'frame','sun');p=selectCosmetic(p,'avatar','pixel-dwarf');assert.equal(p.diamonds,0);assert.equal(p.avatarFrameId,'sun');
 assert.equal(selectCosmetic(p,'frame','unknown'),p);
});
