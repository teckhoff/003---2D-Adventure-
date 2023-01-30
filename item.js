class Potion extends Entity {
    constructor(name = "Item", location = [0, 0], PotionIndex = 0)
    {
        super(name, location, "https://kozmotincan-foundry-vtt-assets.s3.us-east-2.amazonaws.com/2dadventure/img/potion.png");
        this.PotionIndex = PotionIndex;
        
    }

    Collision(entity)
    {
        if (entity.Name == "Player")
        {
            entity.Health = Math.min((entity.Health + 50), entity.MaxHealth);

            if (this.PotionIndex == 1)
            {
                MainClass.Potion1Used = true;
            }

            if (this.PotionIndex == 2)
            {
                MainClass.Potion2Used = true;

            }

            MainClass.RemoveDynamicEntity(this);
        }
    }
}

class AttackUpgrade extends Entity {
    constructor(name = "Item", location = [0, 0])
    {
        super(name, location, "https://kozmotincan-foundry-vtt-assets.s3.us-east-2.amazonaws.com/2dadventure/img/sword_pickup.png");
    }

    Collision(entity)
    {
        if (entity.Name == "Player")
        {
            entity.Attack += Math.round((Math.random() * 4) + 1);
            MainClass.RemoveDynamicEntity(this);
        }
    }
}

class DefenseUpgrade extends Entity {
    constructor(name = "Item", location = [0, 0])
    {
        super(name, location, "https://kozmotincan-foundry-vtt-assets.s3.us-east-2.amazonaws.com/2dadventure/img/shield.png");
    }

    Collision(entity)
    {
        if (entity.Name == "Player")
        {
            entity.Defense += Math.round((Math.random() * 4) + 1);
            MainClass.RemoveDynamicEntity(this);
        }
    }
}