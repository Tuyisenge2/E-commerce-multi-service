import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { Role, User } from "./models";

const configured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_SECRET_ID && process.env.GOOGLE_CALLBACK_URL);

if (configured) {
	passport.use(new GoogleStrategy({
		clientID: process.env.GOOGLE_CLIENT_ID as string,
		clientSecret: process.env.GOOGLE_SECRET_ID as string,
		callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
	}, async (_accessToken, _refreshToken, profile: Profile, done) => {
		try {
			const email = profile.emails?.[0]?.value?.toLowerCase();
			if (!email) return done(new Error("Google account has no email"));
			let user = await User.findOne({ where: { email } });
			if (!user) {
				const role = await Role.findOne({ where: { roleName: "BUYER" } });
				if (!role) return done(new Error("BUYER role is missing"));
				user = await User.create({
					userName: email.split("@")[0], email, firstName: profile.name?.givenName ?? "",
					lastName: profile.name?.familyName ?? "", password: "google-oauth",
					confirmPassword: "google-oauth", role: role.id, isVerified: true,
				});
			}
			return done(null, user);
		} catch (error) { return done(error as Error); }
	}));
}

export { configured };
export default passport;
