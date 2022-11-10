const axios = require('axios');
const {Videogame, Genre} = require("../db")
const {API_KEY} = process.env;

const getApiInfo = async () => {
    try {
        //Creo un array vacio donde estaran los juegos. Hago una variable page que sera la que traera los 15 juegos por pagina de la api
        //Por eso hago un for hasta el 5. Asi me traigo solo 100 juegos y no todos los que ofrece la api
        let results = [];
        const queries = [];
        const pages = [1,2,3,4,5];
        
        pages.forEach((page) => {
            queries.push(axios.get(`https://api.rawg.io/api/games?key=${API_KEY}&page=${page}`));
        });
        await Promise.all(queries) 
            .then((queryResults) => {
                queryResults.forEach((queryResult) => {
                    let response = queryResult.data
                    results.push(
                        ...response.results.map((e) => ({
                            id: e.id,
                            name: e.name,
                            background_image: e.background_image,
                            genres: e.genres.map((g) => g),
                            rating: e.rating,
                            platforms: e.platforms.map((p) => `${p.platform.name}`)
                        }))
                    )
                })
            })
            .then(() => results)
            .catch((err) => console.log(err));
            return results
    } catch (err) {
        console.log(err)
    }
}

const callDbInfo = async () => {
    try {
        return await Videogame.findAll({
            include:{
                model: Genre,
                attributes: ['name'],
                trough: {
                    attributes: [],
                }
            },
        })
    } catch (err) {
        console.log(err);
    }
}

const callAllVideogames = async () => {
    const apiData = await getApiInfo();
    const dbData = await callDbInfo();
    const dataTotal = apiData.concat(dbData);
    return dataTotal;
}

const allGames = async (req,res) => {
    // ME GUARDO EL NAME QUE ME LLEGA POR QUERY PARA USARLO CUANDO LO INDIQUE
    const {name} = req.query;
    try {
        let allVideogames = await callAllVideogames();
        if(name){
            let videogameName = allVideogames.filter(game => game.name.toLowerCase().includes(name.toLowerCase()));
            videogameName.length ? 
            res.status(200).send(videogameName) : 
            res.status(404).send('Este videogame no existe');
        }else{
            res.status(200).send(allVideogames);
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const createGenreDb = async (req,res) => {
    try {
        const genre = await axios.get(`https://api.rawg.io/api/genres?key=${API_KEY}`);
        const {results} = genre.data;
        //Itero cada uno de los resultados para extraer las propiedades name, si existe no la creo y si no existe la creo
        for (let i = 0; i < results.length; i++) {
            const {name} = results[i]
            await Genre.findOrCreate({
                where: {name: name}
            })
        }
        res.status(200).json(await Genre.findAll());
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const gameById = async (req,res) => {
    const id =  req.params.idVideogame;
    try {
        allVideogames = await callAllVideogames();
        if(id.length > 20){ // esto es porque los id de los games de la db pasan los 20 digitos
            let gameId = await allVideogames.filter(g=> g.id == id);// filtro por id mis juegos de la db 
            gameId.length?
            res.status(200).json(gameId) : // si lo encuentra lo envia
            res.status(404).send('Videogame not found') // sino envia un mensaje de error
        }else{
            const videogame = await axios.get(`https://api.rawg.io/api/games/${id}?key=${API_KEY}`);
        if (videogame === undefined) {
            res.status(404).send("Videogame not found");
        } else {
                const {
                    id,
                    name,
                    background_image,
                    description_raw,
                    released,
                    rating,
                    platforms,
                    genres
                } = videogame.data;

                let game = [];

                game.push({
                    id,
                    name,
                    background_image,
                    description: description_raw,
                    released,
                    rating,
                    platforms: platforms.map((p) => ` ${p.platform.name} `),
                    genres: genres.map((g) => g.name)
                });
                res.status(200).json(game);
            }
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const createGame = async (req,res) => {
    try {
        const { name, description, released, rating, platforms, genres, background_image } = req.body;
        console.log(req.files)
        const newVideogame = await Videogame.create({
            name,
            description,
            platforms,
            rating,
            released,
            background_image
        });
        const genreDb = await Genre.findAll({
            where:{ name: genres}
         });
         newVideogame.addGenre(genreDb);
         res.send('Videogame Successfully Created');
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const allPlatforms = async(req,res) =>{
    try {
        const games = await callAllVideogames(); // me traigo los 100 juegos de la api y los de mi db
        const everyPlatforms = []; 
        games.forEach(g => { // recorro los juegos y pusheo a un array todos las plataformas existentes
            ({platforms} = g);
            everyPlatforms.push(platforms) 
        });
        arrayPlat = [];
        for (let i = 0; i < everyPlatforms.length; i++) { // recorro todas las plataformas y pusheo sus name a un array
            everyPlatforms[i].map((p) => {
                arrayPlat.push(p)
            })
        }
        const names = [...new Set(arrayPlat)] // hago un new Set a el array de names para que no se repitan y lo envio
        res.status(200).json(names) 
    }
    catch (error) {
        res.status(500).json({message: error.message})
    }
}

module.exports = {
    allGames,
    gameById,
    createGenreDb,
    createGame,
    allPlatforms
}