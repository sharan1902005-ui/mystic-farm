export function chooseDialogue(npc, context = {}) {
  if (npc.friendship >= 8 && npc.dialogue?.highFriendship) {
    return npc.dialogue.highFriendship;
  }

  return npc.dialogue?.[context.season] || npc.dialogue?.default || "Hello.";
}
