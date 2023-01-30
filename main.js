class main 
{
    constructor()
    {
        // The HTML5 object that is going to contain our game
        this.canvas = document.createElement("canvas");
        // Context is going to run in immediate mode:
        // i.e., when you go to draw something it happens immediately.
        // When we do draw it, we're done with it. It's done with.
        this.context = this.canvas.getContext("2d");
        // Context variables are like state variables: only change when changed.

        // No game exemplifies the style of adventure like a Zelda game.
        // Because of this, I'm going to mimic the screen size of the original NES Zelda.
        // Note, the original Zelda was 'technically' 16x15 tiles. That includes the top bar, though.
        // The playable area is only 16x11.
        this.TileSize = 64
        this.ScreenSizeInTiles = [16, 11];
        this.canvas.width = this.TileSize * this.ScreenSizeInTiles[0];
        this.canvas.height = this.TileSize * this.ScreenSizeInTiles[1];

        // Static Entities represents entities whose update function is never getting called. This is typically 
        // going to be background elements, or just anything that is not going to change.
        // The big difference is that the Update() function is never going to be called for static entities.
        // We also have an array to keep track of entities when the screen changes. These 'old statics' are going to be deleted after the transition.
        this.StaticEntities = [];
        this.OldStatics = [];

        // Dynamic Entities represents entities that are going to change over the course of the game.
        // Examples would be the character, enemies, or background objects that can be interacted with.
        this.DynamicEntities = [];

        // This is all information used to handle the transition between two different screens on the map.
        // InLevelTransition provides that classic Zelda freeze-frame while the effect is playing.
        // The transition counter is used to keep track of how many tiles remaining have to be scrolled on-screen.
        // The transition direction is the cardinal direction the screen is currently scrolling.
        this.InLevelTransition = false;
        this.ScreenSizeToCheck = 0;
        this.TransitionCounter = 0;
        this.TransitionDirection = [0, 0];

        // Potions in spawn
        this.Potion1Used = false;
        this.Potion2Used = false;

        // Game end state
        this.EnemyCount = 15;
        this.IsGameOver = false;
        this.PlayerWon = false;

        // Going to default set the canvas to green, to represent the state before drawing any content.
        this.context.fillStyle = "#30CD50";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Display a message that the game is loading.
        this.context.font = "42px serif";
        this.context.fillStyle = "#fff"
        this.context.fillText("Loading...", 0, 50);
        this.context.strokeText("Loading...", 0, 50);
        this.context.fillText("If the game does not start, check your internet connection.", 0, 100);
        this.context.strokeText("If the game does not start, check your internet connection.", 0, 100);
        this.context.fillText("JavaScript can't load JSON except by over a web request!", 0, 150);
        this.context.strokeText("JavaScript can't load JSON except by over a web request!", 0, 150);

        // Add the Canvas to the element in our HTML.
        // This is only being done for organization. I could just add it straight to the document.
        document.getElementById("Canvas").appendChild(this.canvas);

        // Variables that handle the controls.
        // W pressed: YMovement = -1.
        // S pressed: YMovement = 1.
        // A pressed: XMovement = -1.
        // D pressed: XMovement = 1.
        this.XMovement = 0;
        this.YMovement = 0;     
        
        // Handle current level state and load the level data from JSON
        this.CurrentLevel = null;
        fetch("https://kozmotincan-foundry-vtt-assets.s3.us-east-2.amazonaws.com/2dadventure/gamedata_alt.json")
        .then((response) => response.json())
        .then((data) => { this.LevelData = data; });
    }

    // Helper function for clearing the static entities array. In case I want to add logic here eventually.
    ClearStaticEntities()
    {
        this.StaticEntities = [];
    }

    // Helper function for clearing the static entities array. This exists for parity with ClearStaticEntities().
    ClearOldStaticEntities()
    {
        this.OldStatics = [];
    }

    // Helper function for clearing the dynamic entities array. Exists so I can prevent the player being deleted.
    ClearDynamicEntities(ClearPlayer = false)
    {
        if (!ClearPlayer)
        {
            while(this.DynamicEntities.length > 1)
            {
                this.DynamicEntities.pop();
            }
        } else {
            this.DynamicEntities = [];
        }
        
    }

    // Helper function to remove a single dynamic entity from the array.
    RemoveDynamicEntity(entityToRemove)
    {
        this.DynamicEntities.splice(this.DynamicEntities.indexOf(entityToRemove), 1);
    }

    // This is the main game loop.
    // First, it checks if we're in a level transition, and handles that accordingly.
    // Then, we're going to update all of our Dynamic Entities.
    // After we perform the update logic, we can clear the screen and render all of our entities.
    UpdateGame()
    {
        if (this.IsGameOver == true) { this.GameOver(this.PlayerWon); return; }
        if (this.InLevelTransition == true) { this.TransitionToNewLevelEffect(); return; }

        for (let x of this.DynamicEntities) 
        {
            x.Update();
        }

        this.context.fillStyle = this.LevelData[this.CurrentLevel].bg_color;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let x of this.StaticEntities) 
        {
            x.Render();
        }

        for (let x of this.OldStatics) 
        {
            x.Render();
        }

        for (let x of this.DynamicEntities) 
        {
            x.Render();
        }
    }

    // Helper function for determining if there is a collision between two entities.
    // The rubric says to keep the location on the entities. So, we loop through all of the entities and check if there is a collision.
    FindTileCollision(checkingEntity, positionToCheck)
    {
        for (let x of this.DynamicEntities) 
        {
            if (x.Location[0] == positionToCheck[0] && x.Location[1] == positionToCheck[1] && x.CanCollide)
            {
                x.Collision(checkingEntity);
                return x;
            }
        }

        for (let x of this.StaticEntities)
        {
            if (x.Location[0] == positionToCheck[0] && x.Location[1] == positionToCheck[1] && x.CanCollide)
            {
                return x;
            }
        }

        return null;
    }

    // Function that generates the static entities from a JSON file. Used to create the map at runtime, when needed.
    // level: The ID of the level to load.
    // tileOffset: A helper variable that allows us to generate a new map off screen, to allow for our transition effect.
    LoadLevelFromJSON(level, tileOffset = [0, 0])
    {
        this.CurrentLevel = level;
        
        this.OldStatics = this.StaticEntities;
        this.ClearStaticEntities();
        this.ClearDynamicEntities();

        var index = 0;
        for (let x of this.LevelData[level].map)
        {
            if (x != "*") 
            {
                if (x == "!")
                {
                    this.StaticEntities.push(new Tree("Tree", [index % this.ScreenSizeInTiles[0] + tileOffset[0], Math.floor(index / this.ScreenSizeInTiles[0]) + tileOffset[1]]));
                } else if (x == "@")
                {
                    this.StaticEntities.push(new Rock("Rock", [index % this.ScreenSizeInTiles[0] + tileOffset[0], Math.floor(index / this.ScreenSizeInTiles[0]) + tileOffset[1]]));
                } else {
                // The logic here is that our map is stored in a JSON array that is 15x11 (176) characters long.
                // We get the X coordinate with the modulo operator, clamping it between 0 and 15.
                // We get the Y coordinate by flooring the division of it by 11.
                // We then add the offset as needed.
                    this.StaticEntities.push(new Entity("tile", [index % this.ScreenSizeInTiles[0] + tileOffset[0], Math.floor(index / this.ScreenSizeInTiles[0]) + tileOffset[1]], this.LevelData[level].tileset[x]));
                }
            }
            index++;
        }
    }

    // A function that is going to eventually load our level from JSON.
    // First, though, we perform logic to determine how we have to scroll the screen.
    // We convert the cardinal direction to a 2D array determining how we're going to scroll the screen.
    // We're using 0.125 to apply a smoother scrolling effect.
    SpawnLevel(level, direction)
    {
        this.InLevelTransition = true;

        switch (direction) 
        {
            case "North":
                this.ScreenSizeToCheck = this.ScreenSizeInTiles[1];
                this.TransitionCounter = this.ScreenSizeInTiles[1] * 8;
                this.LoadLevelFromJSON(level, [0, 0 - this.ScreenSizeInTiles[1]]);
                this.TransitionDirection = [0, 0.125];
                break;
            case "East":
                this.ScreenSizeToCheck = this.ScreenSizeInTiles[0];
                this.TransitionCounter = this.ScreenSizeInTiles[0] * 8;
                this.LoadLevelFromJSON(level, [this.ScreenSizeInTiles[0], 0]);
                this.TransitionDirection = [-0.125, 0];
                break;
            case "South":
                this.ScreenSizeToCheck = this.ScreenSizeInTiles[1];
                this.TransitionCounter = this.ScreenSizeInTiles[1] * 8;
                this.LoadLevelFromJSON(level, [0, this.ScreenSizeInTiles[1]]);
                this.TransitionDirection = [0, -0.125];
                break;
            case "West":
                this.ScreenSizeToCheck = this.ScreenSizeInTiles[0];
                this.TransitionCounter = this.ScreenSizeInTiles[0] * 8;
                this.LoadLevelFromJSON(level, [0 - this.ScreenSizeInTiles[0], 0]);
                this.TransitionDirection = [0.125, 0];
                break;
        }
    }

    // Function that handles determining if there is even a level we can transition to.
    TransitionToNewLevel(direction, player = this.DynamicEntities[0])
    {
        if (this.LevelData[this.CurrentLevel].adjacent_levels[direction])
        {
            this.SpawnLevel(this.LevelData[this.CurrentLevel].adjacent_levels[direction], direction);
            return true;
        }

        return false;
    }

    // This function exists only to provide that nice screen scrolling effect the first Zelda game had.
    // Best way to implement this? Probably not. Is it functional? Yes, very.
    TransitionToNewLevelEffect()
    {
        // We only want to run this function if InLevelTransition is true.
        // It should never be false when this is called, but just in case.
        if (this.InLevelTransition) {
            // Now, we need to determine if we're at the end of the transition effect. If so, we're going to clean up and unpause our game loop.
            if (this.TransitionCounter <= 0) {
                this.TransitionDirection = [0, 0];
                this.ClearOldStaticEntities();

                // We're also going to spawn enemies and items.
                var index = 0;
                for (let x of this.LevelData[this.CurrentLevel].enemies)
                {
                    if (this.CurrentLevel == "spawn")
                    {
                        if (this.EnemyCount > 3)
                        {
                            break;
                        }
                    }

                    if (x.IsDead == null)
                    {
                        x.IsDead = false;
                    } else if (x.IsDead == true) {
                        index++;
                        continue;
                    }

                    this.DynamicEntities.push(new Enemy(x.Name, x.Location, x.Image, [x.Health, x.Attack, x.Defense], x.Mode, index));
                    index++;
                }

                if (this.CurrentLevel == "spawn")
                {
                    if (!this.Potion1Used)
                    {
                        MainClass.DynamicEntities.push(new Potion("Potion", [2, 8], 1));
                    }

                    if (!this.Potion2Used)
                    {
                        MainClass.DynamicEntities.push(new Potion("Potion", [13, 8], 2));
                    }
                }

                this.InLevelTransition = false;
                return;
            }

            // Step one is to fill the screen with the new screen's background color.
            this.context.fillStyle = this.LevelData[this.CurrentLevel].bg_color;
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Then, we 
            for (let x of this.DynamicEntities) 
            {
                if (x.Name == "Player" && (Math.floor(this.TransitionCounter / 8)) == 5) { x.Render(); continue; }

                x.Location[0] += this.TransitionDirection[0];
                x.Location[1] += this.TransitionDirection[1];

                x.Render();
            }
    
            for (let x of this.StaticEntities)
            {
                x.Location[0] += this.TransitionDirection[0];
                x.Location[1] += this.TransitionDirection[1];

                x.Render();
            }

            for (let x of this.OldStatics)
            {
                x.Location[0] += this.TransitionDirection[0];
                x.Location[1] += this.TransitionDirection[1];

                x.Render();
            }

            this.TransitionCounter--;
        }
    }

    IsInBounds(entity)
    {
        if (entity.Location[0] < 0) { return false; }
        if (entity.Location[0] >= this.ScreenSizeInTiles[0]) { return false; }
        if (entity.Location[1] < 0) { return false; }
        if (entity.Location[1] >= this.ScreenSizeInTiles[1]) { return false; }

        return true;
    }

    GameOver(DidWin = false)
    {
        if (DidWin == false)
        {
            // Going to default set the canvas to green, to represent the state before drawing any content.
            this.context.fillStyle = "#30CD50";
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Display a message that the game is loading.
            this.context.font = "42px serif";
            this.context.fillStyle = "#FF0000"
            this.context.fillText("Game Over. . .", 0, 50);
            this.context.fillText("You have perished and the kingdom has fallen into ruin.", 0, 100);
            this.context.fillText("Refresh the page to try again.", 0, 150);
            
        } else {
            // Going to default set the canvas to green, to represent the state before drawing any content.
            this.context.fillStyle = "#30CD50";
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Display a message that the game is loading.
            this.context.font = "42px serif";
            this.context.fillStyle = "#00FFFF"
            this.context.fillText("You won!", 0, 50);
            this.context.fillText("You saved the kingdom from complete destruction!", 0, 100);
            this.context.fillText("This ends the story.", 0, 150);
        }
    }
}