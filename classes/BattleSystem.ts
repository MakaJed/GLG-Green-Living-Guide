import { Creature, Skill, EcoType } from './battle';

export interface BattleState {
    playerPet: Creature;
    enemy: Creature;
    isPlayerTurn: boolean;
    turnCount: number;
    battleLog: string[];
    party: Creature[];
}

export type BattleAction = {
    type: 'SKILL' | 'BASIC_ATTACK' | 'DEFEND' | 'ACTIVATE_RECYCLE' | 'REST' | 'SWITCH_PET' | 'ITEM';
    skill?: Skill;
    targetPet?: Creature;
    item?: {
        name: string;
        effect: 'heal' | 'ep' | 'status';
        value: number;
        description: string;
    };
};

export class BattleSystem {
    private state: BattleState;

    constructor(playerPet: Creature, enemy: Creature, party: Creature[] = []) {
        this.state = {
            playerPet,
            enemy,
            isPlayerTurn: playerPet.stats.speed >= enemy.stats.speed,
            turnCount: 0,
            battleLog: [`Battle started between ${playerPet.name} and ${enemy.name}!`],
            party: [playerPet, ...party]
        };
    }

    public executeAction(action: BattleAction): string[] {
        const { playerPet, enemy, isPlayerTurn } = this.state;
        const logs: string[] = [];

        if (isPlayerTurn) {
            // Player's turn
            switch (action.type) {
                case 'SKILL':
                    if (action.skill) {
                        const damage = action.skill.execute(playerPet, enemy);
                        logs.push(`${playerPet.name} used ${action.skill.name} for ${damage} damage!`);
                    }
                    break;
                case 'BASIC_ATTACK':
                    const damage = playerPet.basicAttack(enemy);
                    logs.push(`${playerPet.name} used Basic Attack for ${damage} damage!`);
                    break;
                case 'DEFEND':
                    logs.push(`${playerPet.name} is defending!`);
                    break;
                case 'REST':
                    const epRecovery = Math.floor(playerPet.stats.mp * 0.5);
                    playerPet.currentMp = Math.min(playerPet.stats.mp, playerPet.currentMp + epRecovery);
                    logs.push(`${playerPet.name} rested and recovered ${epRecovery} EP!`);
                    break;
                case 'SWITCH_PET':
                    if (action.targetPet && action.targetPet !== playerPet) {
                        const targetPetIndex = this.state.party.findIndex(p => p === action.targetPet);
                        if (targetPetIndex !== -1) {
                            this.state.playerPet = action.targetPet;
                            logs.push(`${playerPet.name} switched out!`);
                            logs.push(`${action.targetPet.name} joined the battle!`);
                        }
                    }
                    break;
                case 'ITEM':
                    if (action.item) {
                        if (action.item.effect === 'heal') {
                            // Calculate healing amount based on max HP
                            const healAmount = Math.floor(playerPet.stats.hp * action.item.value);
                            
                            // Apply healing boost if the pet has one (primarily for Compostable types)
                            const finalHealAmount = playerPet.healingBoost ? 
                                Math.floor(healAmount * playerPet.healingBoost) : healAmount;
                                
                            playerPet.currentHp = Math.min(playerPet.stats.hp, playerPet.currentHp + finalHealAmount);
                            logs.push(`${playerPet.name} used ${action.item.name} and recovered ${finalHealAmount} HP!`);
                            
                            // Compostable pets get a small EP boost when healing
                            if (playerPet.type === EcoType.COMPOSTABLE) {
                                const epBonus = Math.floor(playerPet.stats.mp * 0.05); // 5% EP bonus
                                playerPet.currentMp = Math.min(playerPet.stats.mp, playerPet.currentMp + epBonus);
                                logs.push(`${playerPet.name}'s compostable nature converted some healing into ${epBonus} EP!`);
                            }
                        } else if (action.item.effect === 'ep') {
                            // EP recovery items restore a fixed amount
                            const epAmount = action.item.value;
                            playerPet.currentMp = Math.min(playerPet.stats.mp, playerPet.currentMp + epAmount);
                            logs.push(`${playerPet.name} used ${action.item.name} and recovered ${epAmount} EP!`);
                            
                            // Recyclable pets get a small HP boost when restoring EP
                            if (playerPet.type === EcoType.RECYCLABLE) {
                                const hpBonus = Math.floor(playerPet.stats.hp * 0.05); // 5% HP bonus
                                playerPet.currentHp = Math.min(playerPet.stats.hp, playerPet.currentHp + hpBonus);
                                logs.push(`${playerPet.name}'s recyclable nature converted some energy into ${hpBonus} HP!`);
                            }
                        }
                    }
                    break;
            }

            // Check if enemy is defeated
            if (enemy.isDefeated()) {
                const expGain = Math.floor(50 * enemy.level);
                this.state.party.forEach(pet => {
                    const { leveledUp, newLevel } = pet.addExp(expGain);
                    if (leveledUp) {
                        logs.push(`${pet.name} grew to level ${newLevel}!`);
                    }
                });
                logs.push(`${enemy.name} was defeated!`);
                logs.push(`Party gained ${expGain} EXP!`);
                return logs;
            }
        } else {
            // Enemy's turn
            const damage = enemy.basicAttack(playerPet);
            logs.push(`${enemy.name} attacks for ${damage} damage!`);

            // Check if player is defeated
            if (playerPet.isDefeated()) {
                const otherPartyMembers = this.state.party.filter(p => p !== playerPet && !p.isDefeated());
                if (otherPartyMembers.length > 0) {
                    this.state.playerPet = otherPartyMembers[0];
                    logs.push(`${playerPet.name} was defeated!`);
                    logs.push(`${this.state.playerPet.name} joined the battle!`);
                } else {
                    logs.push(`${playerPet.name} was defeated!`);
                    return logs;
                }
            }
        }

        // Only switch turns if battle is not over
        if (!this.isGameOver()) {
            this.state.isPlayerTurn = !isPlayerTurn;
            this.state.turnCount++;
        }

        return logs;
    }

    public getState(): BattleState {
        return { ...this.state };
    }

    public isGameOver(): boolean {
        return this.state.playerPet.isDefeated() && 
               this.state.party.every(pet => pet.isDefeated()) || 
               this.state.enemy.isDefeated();
    }

    public getWinner(): Creature | null {
        if (!this.isGameOver()) return null;
        return this.state.enemy.isDefeated() ? this.state.playerPet : this.state.enemy;
    }

    public getParty(): Creature[] {
        return [...this.state.party];
    }
} 