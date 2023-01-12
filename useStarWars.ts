import { useEffect, useState } from "react";

export interface StarWarsCharacter {
  name: string;
  picture: string;
  seen?: boolean
}
// inspired by https://github.com/animatk/ReactJS-Star-Wars-API
export const useStarWars = () => {
  const [characters, setCharacters] = useState<StarWarsCharacter[]>();

  useEffect(() => {
    const getImgUrl = (resourceUrl: string) => {
      const imgUrlBase =
        "https://starwars-visualguide.com/assets/img/characters/";
      const filePath =
        resourceUrl.split("https://swapi.dev/api/people/")[1].slice(0, -1) +
        ".jpg";
      return imgUrlBase + filePath;
    };

    fetch("https://swapi.dev/api/people/")
      .then((res) => res.json())
      .then((resp) => {
        setCharacters(
          resp.results.map((character: any) => {
            return { name: character.name, picture: getImgUrl(character.url) };
          })
        );
      });
  }, []);

  return characters;
};
