


export function GenerateBoard (){
  let newBoard = '';
  for (let i = 0; i < 6; i++){

    // creating new random board id in hexadecimal
    let temp = Math.ceil(Math.random()*16).toString(16).toUpperCase();


    newBoard+= temp;
  }


  return newBoard;

}
