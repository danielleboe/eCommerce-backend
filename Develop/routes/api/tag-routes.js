const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', (req, res) => {
  // find all tags
  Tag.findAll({
    include: [Product]
  })
  .then(tags => res.json(tags))
  .catch(err => res.status(500).json(err));

  // be sure to include its associated Product data
});

router.get('/:id', (req, res) => {
  // find a single tag by its `id`
  

  Tag.findOne({
    where: { id: req.params.id },
// be sure to include its associated Product data
    include: [Product]
  })
  .then(tag => res.json(tag))
  .catch(err => res.status(500).json(err));
});

router.post('/', (req, res) => {
  // create a new tag
  Tag.create(req.body)
  .then(tag => res.json(tag))
  .catch(err => res.status(500).json(err))
});



router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
 
    Tag.destroy({
      where: { id: req.params.id }
    })
    .then(tag => res.json(tag))
    .catch(err => res.status(500).json(err));
});

module.exports = router;
