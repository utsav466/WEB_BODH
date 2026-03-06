import { Request, Response } from "express";
import { SettingsModel } from "../models/settings.model";

// GET SETTINGS
export async function getSettings(_: Request, res: Response) {
  try {
    let settings = await SettingsModel.findOne();

    if (!settings) {
      settings = await SettingsModel.create({});
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to load settings",
    });
  }
}

// UPDATE SETTINGS
export async function updateSettings(req: Request, res: Response) {
  try {
    const { storeName, supportEmail, currency } = req.body;

    let settings = await SettingsModel.findOne();

    if (!settings) {
      settings = await SettingsModel.create({
        storeName,
        supportEmail,
        currency,
      });
    } else {
      settings.storeName = storeName;
      settings.supportEmail = supportEmail;
      settings.currency = currency;

      await settings.save();
    }

    res.json({
      success: true,
      message: "Settings updated",
      data: settings,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to update settings",
    });
  }
}