import { createAdminUser, getAdminCount, loginAdmin } from "../services/authService.js";
import { env } from "../config/env.js";

export async function seedAdmin(req, res) {
  try {
    const suppliedBootstrapKey = req.headers["x-bootstrap-key"];

    if (env.bootstrapAdminKey && suppliedBootstrapKey !== env.bootstrapAdminKey) {
      return res.status(403).json({
        message: "Invalid bootstrap key.",
      });
    }

    const existingAdminCount = await getAdminCount();

    if (existingAdminCount > 0) {
      return res.status(409).json({
        message: "Admin user already exists. Seed endpoint is disabled after initial setup.",
      });
    }

    const { adminId, email, fullName, role, password } = req.body;

    if (!adminId || !email || !fullName || !role || !password) {
      return res.status(400).json({
        message: "adminId, email, fullName, role, and password are required.",
      });
    }

    const admin = await createAdminUser({
      adminId,
      email,
      fullName,
      role,
      password,
    });

    res.status(201).json(admin);
  } catch (error) {
    console.error("Failed to create admin:", error);
    res.status(500).json({
      message: "Failed to create admin.",
      error: error.message,
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const result = await loginAdmin(email, password);

    if (!result) {
      return res.status(401).json({
        message: "Invalid credentials.",
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({
      message: "Login failed.",
      error: error.message,
    });
  }
}