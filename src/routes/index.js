const { Router } = require('express');

// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');

const router = Router();
const { createGenreDb, allGames, gameById, createGame, allPlatforms} = require('../controllers/videogames.controllers.js')

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);
    
router.get('/videogames', allGames)

router.get('/genres', createGenreDb)

router.get('/videogame/:idVideogame', gameById)

router.post('/videogame', createGame)

router.get('/platforms', allPlatforms)

module.exports = router;
