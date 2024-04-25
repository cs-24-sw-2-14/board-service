


export function GenerateBoard (){
  let newBoard = '';

  while (true){

    for (let i = 0; i < 6; i++){
      // creating new random board id in hexadecimal
      let temp = Math.ceil(Math.random()*15).toString(16).toUpperCase();
      newBoard+= temp;

    }

    if (CheckNewBoard() === false){
      //returns board id if it doesnt exist yet
      return newBoard;

    }

}



  }


// TODO:  need to add function that checks if the newly generated board exists
function CheckNewBoard(){

  return false;
}
