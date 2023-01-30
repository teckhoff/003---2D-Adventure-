class Player extends Character
{
    constructor(name = "Player", location = [0, 0], image = null, attributes = [100, 1, 1])
    {
        super(name, location, image, attributes);

        this.ImageFront = new Image();
        this.ImageFront.src = "https://kozmotincan-foundry-vtt-assets.s3.us-east-2.amazonaws.com/2dadventure/img/hero_front.png";
        this.ImageBack = new Image();
        this.ImageBack.src = "https://kozmotincan-foundry-vtt-assets.s3.us-east-2.amazonaws.com/2dadventure/img/hero_back.png";
        this.ImageLeft = new Image();
        this.ImageLeft.src = "https://kozmotincan-foundry-vtt-assets.s3.us-east-2.amazonaws.com/2dadventure/img/hero_left.png"
        this.ImageRight = new Image();
        this.ImageRight.src = "https://kozmotincan-foundry-vtt-assets.s3.us-east-2.amazonaws.com/2dadventure/img/hero_right.png"
    }

    Update()
    {
        if (this.Health <= 0)
        {
            MainClass.IsGameOver = true;
            this.ClearStaticEntities();
            this.ClearDynamicEntities(true);
        }

        if (this.MovementDebounce >= this.MaxMovementDebounce)
        {
            if (MainClass.XMovement != 0 || MainClass.YMovement != 0)
            {
                this.MovementDebounce = 0;

                var newX = this.Location[0] + MainClass.XMovement;
                var newY = this.Location[1] + MainClass.YMovement;
                
                if (newX >= MainClass.ScreenSizeInTiles[0])
                {
                    if (MainClass.TransitionToNewLevel("East", this))
                    {
                        this.Image = this.ImageRight;
                        return;
                    }

                    newX = this.Location[0];
                }

                if (newX < 0)
                {
                    if (MainClass.TransitionToNewLevel("West", this))
                    {
                        this.Image = this.ImageLeft;
                        return;
                    }

                    newX = this.Location[0];
                }

                if (newY >= MainClass.ScreenSizeInTiles[1])
                {
                    if (MainClass.TransitionToNewLevel("South", this))
                    {
                        this.Image = this.ImageFront;
                        return;
                    }

                    newY = this.Location[1];
                }

                if (newY < 0)
                {
                    if (MainClass.TransitionToNewLevel("North", this))
                    {
                        this.Image = this.ImageBack;
                        return;
                    }
                        
                    newY = this.Location[1];
                }

                if (MainClass.YMovement > 0)
                {
                    this.Image = this.ImageFront;
                } else  if (MainClass.YMovement < 0) {
                    this.Image = this.ImageBack;
                }

                if (MainClass.XMovement > 0)
                {
                    this.Image = this.ImageRight;
                } else  if (MainClass.XMovement < 0) {
                    this.Image = this.ImageLeft;
                }

                var CollisionResult = MainClass.FindTileCollision(this, [newX, newY]);

                if (CollisionResult == null)
                {
                    this.Location[0] = newX;
                    this.Location[1] = newY;
                } else {
                    if (CollisionResult.Health != null)
                    {
                        CollisionResult.Damage(this);
                    }
                }
            }
        } else {
            this.MovementDebounce++;
        }
    }
}