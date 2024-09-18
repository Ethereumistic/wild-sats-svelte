import { Scene, GameObjects } from 'phaser';
import axios from 'axios';

interface Animal {
    name: string;
    price: number;
    description: string;
}

export class Animals extends Scene {
    animals: Animal[];
    npub: string | null;
    ownedAnimals: string[];

    constructor() {
        super('Animals');
        this.animals = [
            { name: 'Cat', price: 100, description: 'A cute and cuddly companion' },
            { name: 'Dog', price: 150, description: 'A loyal and playful friend' },
        ];
    }

    init() {
        this.npub = localStorage.getItem('nostr_npub');
        console.log('NPUB from localStorage:', this.npub);
        if (!this.npub) {
            console.error('User not logged in');
            this.scene.start('Shop');
        }
    }

    async create() {
        if (!this.npub) return; // Exit early if not logged in

        // Fetch user's owned animals
        await this.fetchOwnedAnimals();

        this.add.text(512, 50, 'Animal Shop', {
            fontFamily: 'Arial Black',
            fontSize: 48,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
        }).setOrigin(0.5);

        this.animals.forEach((animal, index) => {
            const y = 200 + index * 150;
            this.add.text(512, y, animal.name, {
                fontFamily: 'Arial Black',
                fontSize: 32,
                color: '#ffffff',
            }).setOrigin(0.5);

            this.add.text(512, y + 40, `Price: ${animal.price} coins`, {
                fontFamily: 'Arial',
                fontSize: 24,
                color: '#ffffff',
            }).setOrigin(0.5);

            this.add.text(512, y + 70, animal.description, {
                fontFamily: 'Arial',
                fontSize: 18,
                color: '#ffffff',
            }).setOrigin(0.5);

            const isOwned = this.ownedAnimals.includes(animal.name);
            const buttonText = isOwned ? 'Owned' : 'Buy';
            const buttonColor = isOwned ? '#888888' : '#008000';

            const buyButton = this.add.text(512, y + 110, buttonText, {
                fontFamily: 'Arial Black',
                fontSize: 24,
                color: '#ffffff',
                backgroundColor: buttonColor,
                padding: { x: 20, y: 10 },
            })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                if (!isOwned) {
                    this.buyAnimal(animal);
                }
            });
        });

        const backButton = this.add.text(100, 50, 'Back', {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 },
        })
        .setInteractive()
        .on('pointerdown', () => {
            this.scene.start('Shop');
        });
    }

async fetchOwnedAnimals() {
    try {
        const response = await axios.get(`http://localhost:3000/api/users/${this.npub}/characters`);
        this.ownedAnimals = response.data.characters;
        console.log('Owned animals:', this.ownedAnimals);
    } catch (error) {
        console.error('Error fetching owned animals:', error);
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            console.log('User not found, assuming new user with default Dog');
            this.ownedAnimals = ['Dog'];
        } else {
            console.error('Unexpected error, defaulting to empty array');
            this.ownedAnimals = [];
        }
    }
}

    async buyAnimal(animal: Animal) {
        if (!this.npub) {
            console.error('User not logged in');
            return;
        }
    
        const url = `http://localhost:3000/api/users/${this.npub}/buy-animal`;
        const data = { animal: animal.name };
    
        console.log(`Attempting to buy ${animal.name} for user ${this.npub}`);
        console.log('Request URL:', url);
        console.log('Request data:', data);
    
        try {
            const response = await axios.post(url, data);
            console.log(`Bought ${animal.name}:`, response.data);
            this.add.text(512, 700, `Successfully bought ${animal.name}!`, {
                fontFamily: 'Arial',
                fontSize: 24,
                color: '#00ff00'
            }).setOrigin(0.5);
        } catch (error) {
            console.error(`Error buying ${animal.name}:`, error);
            if (axios.isAxiosError(error)) {
                console.error('Response data:', error.response?.data);
                console.error('Response status:', error.response?.status);
                console.error('Response headers:', error.response?.headers);
            }
            this.add.text(512, 700, `Failed to buy ${animal.name}. Please try again.`, {
                fontFamily: 'Arial',
                fontSize: 24,
                color: '#ff0000'
            }).setOrigin(0.5);
        }
    }
}