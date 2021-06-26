const express = require('express')
const path = require('path')

const app = express()
const PORT = 3000

app.use(express.static(__dirname + '/public'))
  
app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`)
})