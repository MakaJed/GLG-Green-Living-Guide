import { Creature, Skill } from './battle';

export interface BattleState {
    playerPet: Creature;
    enemy: Creature;
    isPlayerTurn: boolean;
    turnCount: number;
    battleLog: string[];
    party: Creature[];
}

export type BattleAction = {
    type: 'SKILL' | 'BASIC_ATTACK' | 'DEFEND' | 'ACTIVATE_RECYCLE' | 'REST' | 'SWITCH_PET';
    skill?: Skill;
    targetPet?: Creature;
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