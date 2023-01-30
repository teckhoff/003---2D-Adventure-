class Character extends Entity
{
    // Characters now have attributes. These attributes are as follows:
    // attributes[0] = the character's health
    // attributes[1] = the character's attack
    // attributes[2] = the character's defense
    constructor(name = "Character", location = [0, 0], image = null, attributes = [100, 1, 1])
    {
        // Call the constructor for the entity class. Handles location, and image.
        super(name, location, image);

        // Create the health system for the character.
        this.MaxHealth = attributes[0];
        this.Health = attributes[0];

        // Create the gameplay attributes for the character.
        this.Attack = attributes[1];
        this.Defense = attributes[2];

        // Movement variables.
        this.MaxMovementDebounce = 10;
        this.MovementDebounce = this.MaxMovementDebounce;

    }

    Render()
    {
        if (this.Image)
        {
            MainClass.context.drawImage(this.Image , this.Location[0] * MainClass.TileSize, 
                this.Location[1] * MainClass.TileSize, MainClass.TileSize, MainClass.TileSize);

            this.RenderHealthBar();
        }
    }

    RenderHealthBar()
    {
        var HealthPercentage = this.Health / this.MaxHealth;
        MainClass.context.strokeStyle = "#FF0000";
        MainClass.context.lineWidth = 4;
        MainClass.context.beginPath();
        MainClass.context.arc((this.Location[0] * MainClass.TileSize) + 55, (this.Location[1] * MainClass.TileSize), 12, 0, (2 * Math.PI) * HealthPercentage, false);
        MainClass.context.stroke();
    }

    Damage(attackingEntity)
    {
        this.Health = Math.max((this.Health - Math.max((attackingEntity.Attack - this.Defense), 1)), 0);
    }
}