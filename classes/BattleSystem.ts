import { Creature, Skill } from './battle';

export interface BattleState {
    playerPet: Creature;
    enemy: Creature;
    isPlayerTurn: boolean;
    turnCount: number;
    battleLog: string[];
}

export type BattleAction = {
    type: 'SKILL' | 'BASIC_ATTACK' | 'DEFEND' | 'ACTIVATE_RECYCLE';
    skill?: Skill;
};

export class BattleSystem {
    private state: BattleState;

    constructor(playerPet: Creature, enemy: Creature) {
        this.state = {
            playerPet,
            enemy,
            isPlayerTurn: playerPet.stats.speed >= enemy.stats.speed, // Faster creature goes first
            turnCount: 0,
            battleLog: [`Battle started between ${playerPet.name} and ${enemy.name}!`]
        };
    }

    public getState(): BattleState {
        return { ...this.state };
    }

    public async executeAction(action: BattleAction): Promise<BattleState> {
        const attacker = this.state.isPlayerTurn ? this.state.playerPet : this.state.enemy;
        const defender = this.state.isPlayerTurn ? this.state.enemy : this.state.playerPet;

        let damage = 0;
        let message = '';

        switch (action.type) {
            case 'SKILL':
                if (action.skill) {
                    if (attacker.currentMp >= action.skill.mpCost) {
                        damage = action.skill.execute(attacker, defender);
                        message = `${attacker.name} used ${action.skill.name} and dealt ${damage} damage!`;
                        
                        // Check for critical effectiveness
                        if (damage > action.skill.power * 1.2) {
                            message += " It's super effective!";
                        } else if (damage < action.skill.power * 0.8) {
                            message += " It's not very effective...";
                        }
                    } else {
                        message = `${attacker.name} doesn't have enough MP to use ${action.skill.name}!`;
                    }
                }
                break;

            case 'BASIC_ATTACK':
                damage = attacker.basicAttack(defender);
                message = `${attacker.name} used a basic attack and dealt ${damage} damage!`;
                break;

            case 'DEFEND':
                attacker.stats.defense *= 1.5; // Temporary defense boost
                message = `${attacker.name} took a defensive stance!`;
                break;

            case 'ACTIVATE_RECYCLE':
                if (attacker.activateRecycleMode()) {
                    message = `${attacker.name} activated Recycle Mode! Stats boosted for 3 turns!`;
                } else {
                    message = `${attacker.name} couldn't activate Recycle Mode! (Gauge not full)`;
                }
                break;
        }

        // Update battle log
        this.state.battleLog.push(message);

        // Check for defeated creatures
        if (defender.isDefeated()) {
            this.state.battleLog.push(`${defender.name} was defeated!`);
            return this.state;
        }

        // Update Recycle Mode status
        attacker.updateRecycleMode();

        // Switch turns
        this.state.isPlayerTurn = !this.state.isPlayerTurn;
        this.state.turnCount++;

        // Reset temporary defense boost if defending
        if (action.type === 'DEFEND') {
            attacker.stats.defense /= 1.5;
        }

        return this.state;
    }

    public getBattleLog(): string[] {
        return [...this.state.battleLog];
    }

    public isGameOver(): boolean {
        return this.state.playerPet.isDefeated() || this.state.enemy.isDefeated();
    }

    public getWinner(): Creature | null {
        if (!this.isGameOver()) return null;
        return this.state.playerPet.isDefeated() ? this.state.enemy : this.state.playerPet;
    }
} 