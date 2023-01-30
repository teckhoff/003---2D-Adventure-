class Enemy extends Character
{
    constructor(name = "Player", location = [0, 0], image = null, attributes = [100, 1, 1], mode = "Random", index)
    {
        super(name, location, image, attributes);
        this.AIMode = mode;
        this.Index = index;
        this.CanMove = true;
        this.MaxMovementDebounce = 20;
        this.InitialPosition = location;
        this.TargetPosition = location;
    }

    Update()
    {
        if (this.Health <= 0)
        {
            MainClass.LevelData[MainClass.CurrentLevel].enemies[this.Index].IsDead = true;

            MainClass.EnemyCount--;

            if (MainClass.EnemyCount == 0)
            {
                MainClass.PlayerWon = true;
                MainClass.IsGameOver = true;
            }
            
            var ItemToSpawn = Math.floor(Math.random() * 8);

            switch(ItemToSpawn) {
                case 0:
                case 1:
                    break;
                case 2:
                    MainClass.DynamicEntities.push(new Potion("Potion", this.Location));
                    break;
                case 3:
                case 4:
                    MainClass.DynamicEntities.push(new AttackUpgrade("+Attack", this.Location));
                    break;
                case 5:
                case 6:
                case 7:
                        MainClass.DynamicEntities.push(new DefenseUpgrade("+Defense", this.Location));
                        break;
            }

            MainClass.RemoveDynamicEntity(this);
            return;
        }

        if (this.MovementDebounce >= this.MaxMovementDebounce)
        {
            this.MovementDebounce = 0;
            var newX = this.Location[0];
            var newY = this.Location[1];

            switch (this.AIMode) {
                // Total random movement.
                case "Random":
                    var Direction = Math.floor(Math.random() * 4);

                    switch(Direction) {
                        case 0: // North
                            newY--;
                            break;
                        case 1: // East
                            newX++;
                            break;
                        case 2: // South
                            newY++;
                            break;
                        case 3: // West
                            newX--;
                            break;
                    }
                    break;

                // Always pursues the player. This is going to be a ghost enemy that is going to attack the player and then
                // disappear.
                case "Pursue":
                    this.TargetPosition = MainClass.DynamicEntities[0].Location;

                    if (this.TargetPosition[1] > this.Location[1])
                    {
                        newY++;
                    } else if (this.TargetPosition[1] < this.Location[1]) {
                        newY--;
                    }

                    if (this.TargetPosition[0] > this.Location[0])
                    {
                        newX++;
                    } else if (this.TargetPosition[0] < this.Location[0]) {
                        newX--;
                    }

                    break;

                // Follows the player when sighted.
                case "Investigate":
                    if (MainClass.DynamicEntities[0].Location[0] == this.Location[0] ||
                        MainClass.DynamicEntities[0].Location[1] == this.Location[1])
                    {
                        this.TargetPosition = MainClass.DynamicEntities[0].Location
                    } else {
                        this.TargetPosition = this.Location
                    }

                    if (this.TargetPosition[1] > this.Location[1])
                    {
                        newY++;
                    } else if (this.TargetPosition[1] < this.Location[1]) {
                        newY--;
                    }

                    if (this.TargetPosition[0] > this.Location[0])
                    {
                        newX++;
                    } else if (this.TargetPosition[0] < this.Location[0]) {
                        newX--;
                    }

                    break;
            }

            
            if (newX >= MainClass.ScreenSizeInTiles[0])
            {
                newX = this.Location[0];
            }

            if (newX < 0)
            {
                newX = this.Location[0];
            }

            if (newY >= MainClass.ScreenSizeInTiles[1])
            {
                newY = this.Location[1];
            }

            if (newY < 0)
            {
                newY = this.Location[1];
            }

            var CollisionResult = MainClass.FindTileCollision(this, [newX, newY])
            if (CollisionResult == null)
            {
                if (this.CanMove == true)
                {
                    this.Location[0] = newX;
                    this.Location[1] = newY;
                    this.CanMove = false;
                    return;
                }
            } else {
                if (CollisionResult.Name == "Player")    
                {
                    CollisionResult.Damage(this);
                } else {
                    this.TargetPosition = this.Location;
                }
            }

            this.CanMove = true;

        } else {
            this.MovementDebounce++;
        }
    }
}
