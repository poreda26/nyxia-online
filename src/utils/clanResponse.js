export function mergeClanResponse(player, serverClan) {
  if (!serverClan) return player.clan ? { ...player, clan: null } : player;
  const next = {
    ...player,
    clan: {
      id: serverClan.id,
      name: serverClan.name,
      color: serverClan.color,
      avatarId:serverClan.avatarId||'wolf',
      role: serverClan.myRole,
      createdAt: serverClan.createdAt,
      members: serverClan.members,
      treasury: serverClan.treasury,
      buildingLevel: serverClan.buildingLevel,
      myNpDonated: serverClan.myDonatedNp,
      boss: player.clan?.id===serverClan.id ? player.clan?.boss || null : player.clanBossArchive?.[serverClan.id] || null,
    },
  };
  return JSON.stringify(player.clan)===JSON.stringify(next.clan)?player:next;
}
