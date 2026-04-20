import Garbage from '../models/garbageModel.js';

export const createGarbage = async (req, res) => {
  try {
    const { name, lat, long } = req.body;
    const garbage = new Garbage({ name, lat, long });
    await garbage.save();
    res.status(201).json({ success: true, data: garbage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllGarbage = async (req, res) => {
  try {
    const garbageList = await Garbage.find();
    res.status(200).json({ success: true, data: garbageList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGarbage = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Garbage.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Garbage not found' });
    }
    res.status(200).json({ success: true, message: 'Garbage deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
