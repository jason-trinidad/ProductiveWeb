import React from 'react';

import "./FiveMin.css"

const FiveMin = (props) => {
    const handleDrop = () => {
        console.log("Dropped on:");
        console.log(props.time);
      };
    
      const handleDragOver = (event) => {
        event.preventDefault();
        console.log(props.time);
      };

    return(
        <div className='fivemin' onDrop={handleDrop} onDragOver={handleDragOver}/>
    )
}

export default FiveMin;