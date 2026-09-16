import React from 'react';
import './SearchFilterBar.css';

interface Props {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    genre: string;
    setGenre: (term: string) => void;
}

export const SearchFilterBar: React.FC<Props> = ({
    searchTerm,
    setSearchTerm,
    genre,
    setGenre,
}) => {
    return (
        <div className="container">
            <input
                type="text"
                placeholder="Search movies by title..."
                onChange={(e) => setSearchTerm(e.target.value)}
                className="searchbar" />

            <select
                className="select"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}>

                <option value="ALL">All Genres</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Action">Action</option>
                <option value="Horror">Horror</option>
                <option value="Romance">Romance</option>
                <option value="Animation">Animation</option>
            </select>

            <input
                type = "date"
                className = "filterdate"
                title ="Filter by show date" />
            
        </div>
    );
};