"POST"
http://localhost:3001/api/auth/register

{
   "username" : "John Doe", 
   "password" : "123123"
}


"POST"
http://localhost:3001/api/auth/login
{
   "username" : "John Doe", 
   "password" : "123123"
}



"PUT"
http://localhost:3001/api/auth/update
{
   "id" : "id_value", 
   "role" : "admin"
}



"DELETE"
http://localhost:3001/api/auth/delete
{
   "id" : "id_value"
}

"PUT"
http://localhost:3001/api/recipes/addFav
{
   "userId": "663161805c29367c03c1d97b",
   "recipeId" :"c9bf37296a0126d18781c952dc45a230"
}

"DELETE"
http://localhost:3001/api/recipes/delFav
{
   "userId": "663161805c29367c03c1d97b",
   "recipeId" :"c9bf37296a0126d18781c952dc45a230"
}

"POST"
http://localhost:3001/api/posts/get
{
    "postId":2
}


"POST"
http://localhost:3001/api/posts/create
{
"authorId": "662d2889e4bae9804f95b1da",
"content": "texto ",
"categoryId": 1,
"postTitle" : "TITULO3EL POST", 
"content": "2este es el texto del contenido del post"
}


"DELETE"
http://localhost:3001/api/posts/delete

{
"postId": 2
}
