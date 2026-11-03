import { ExpandedRequest } from "../middlewares/auth";
class UserUtils {
	static getRequestUserId(req: ExpandedRequest) {
		return req.user?.id as string;
	}
}

export default UserUtils;
