# About
This is a data tool that can be used to transform data from one format into another. 

The intention is to follow the priciples of: 

- Open for extension
- Closed for modification

Great emphasis is put on the extendability factors so that it's easy to create new transformers and data sources/destinations and adding value to the project for each one added. 

In the example dataset I used a cvs from Kaggle. 

# Example data
The example data set is from Kaggle on [Genetic Variant Classifications](https://www.kaggle.com/datasets/kevinarvai/clinvar-conflicting?resource=download)

# Getting started

Install dependencies
- npm install

Start up the example infrastructure
- docker-compose up

Poke into the src/index.ts file. And try out to generate a data source, data destination and a schema from your data source. You can also try and modify the default data transformers and see what is available and how they work. 

Once you are familliar with the struture of the transfomers, feel free to create your own transformers and define the details of your schema. 

Run the script with: 

- npm run start