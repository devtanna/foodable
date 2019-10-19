import React, { useState, useEffect } from 'react';
import { Icon } from 'semantic-ui-react';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const FavoriteBtn = ({ id, slug, onFavRemove = null }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setIsFavorite(checkIsFavorite());
  }, []);

  const checkIsFavorite = () => {
    const favorites = cookies.get('fdb_favorites') || {};
    return slug in favorites && favorites[slug].indexOf(id) !== -1;
  };

  const addToFavorites = () => {
    let favorites = cookies.get('fdb_favorites') || {};

    if (slug in favorites) {
      if (favorites[slug].indexOf(id) === -1) {
        favorites[slug].push(id);
      }
    } else {
      favorites[slug] = [id];
    }

    setIsFavorite(true);
    cookies.set('fdb_favorites', favorites, { path: '/' });
  };

  const removeFromFavorites = () => {
    let favorites = cookies.get('fdb_favorites') || {};

    if (slug in favorites) {
      const found = favorites[slug].indexOf(id);
      if (found !== -1) {
        onFavRemove && onFavRemove(slug, id);
        favorites[slug].splice(found, 1);
      }
    }

    !onFavRemove && setIsFavorite(false);
    cookies.set('fdb_favorites', favorites, { path: '/' });
  };

  return (
    <a>
      {isFavorite ? (
        <Icon onClick={removeFromFavorites} name="heart" color="teal" size="large" />
      ) : (
        <Icon onClick={addToFavorites} name="heart outline" color="teal" size="large" />
      )}
      <style jsx>{`
        a {
          cursor: pointer;
        }
      `}</style>
    </a>
  );
};

export default FavoriteBtn;
