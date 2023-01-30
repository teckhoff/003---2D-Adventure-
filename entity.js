class Entity 
{
    constructor(name = "Entity", location = [0, 0], image = null)
    {
        this.Name = name;
        this.Location = location;
        this.Image = new Image();
        this.Image.width = MainClass.TileSize;
        this.Image.height = MainClass.TileSize;

        if (image) 
        {
            this.Image.src = image;
        }

        this.CanCollide = true;
    }

    // Base Entities have no data that they have to update between frames.
    Update()
    {
    }

    // Just simply renders the image to the screen in the desired position.
    Render()
    {
        if (this.Image)
        {
            MainClass.context.drawImage(this.Image, (this.Location[0] * MainClass.TileSize), 
                this.Location[1] * MainClass.TileSize, MainClass.TileSize, MainClass.TileSize);
            return;
        }
    }

    Collision(collidingEntity)
    {
    }
}

class Tree extends Entity
{
    constructor(name = "Tree", location = [0, 0])
    {
        super(name, location, "");
    }

    Render()
    {
        // Create the tree trunk
        MainClass.context.beginPath();
        MainClass.context.moveTo((this.Location[0] * MainClass.TileSize) + 22, (this.Location[1] * MainClass.TileSize) + 60);
        MainClass.context.lineTo((this.Location[0] * MainClass.TileSize) + 27, (this.Location[1] * MainClass.TileSize) + 40);
        MainClass.context.lineTo((this.Location[0] * MainClass.TileSize) + 37, (this.Location[1] * MainClass.TileSize) + 40);
        MainClass.context.lineTo((this.Location[0] * MainClass.TileSize) + 42, (this.Location[1] * MainClass.TileSize) + 60);
        MainClass.context.lineTo((this.Location[0] * MainClass.TileSize) + 22, (this.Location[1] * MainClass.TileSize) + 60);
        MainClass.context.fillStyle = "#964B00";
        MainClass.context.fill();

        // Create the leaves
        MainClass.context.beginPath();
        MainClass.context.moveTo((this.Location[0] * MainClass.TileSize) + 32, (this.Location[1] * MainClass.TileSize) + 45);
        MainClass.context.lineTo((this.Location[0] * MainClass.TileSize) + 15, (this.Location[1] * MainClass.TileSize) + 50);
        MainClass.context.lineTo((this.Location[0] * MainClass.TileSize) + 15, (this.Location[1] * MainClass.TileSize) + 20);
        MainClass.context.lineTo((this.Location[0] * MainClass.TileSize) + 45, (this.Location[1] * MainClass.TileSize) + 20);
        MainClass.context.lineTo((this.Location[0] * MainClass.TileSize) + 45, (this.Location[1] * MainClass.TileSize) + 50);
        MainClass.context.lineTo((this.Location[0] * MainClass.TileSize) + 32, (this.Location[1] * MainClass.TileSize) + 45);
        MainClass.context.fillStyle = "#00FF00";
        MainClass.context.fill();
    }
}

class Rock extends Entity
{
    constructor(name = "Rock", location = [0, 0])
    {
        super(name, location, null);
    }

    Render()
    {
        // Create the rock
        MainClass.context.beginPath();
        MainClass.context.arc((this.Location[0] * MainClass.TileSize) + 32, (this.Location[1] * MainClass.TileSize) + 32, 32, 0, (2 * Math.PI));
        MainClass.context.fillStyle = "#455667";
        MainClass.context.fill();
        
    }
}