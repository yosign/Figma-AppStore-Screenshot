var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function fetchAppData(appId) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`https://itunes.apple.com/lookup?id=${appId}&country=us`);
        const data = yield response.json();
        if (!data.results || data.results.length === 0) {
            throw new Error('App not found');
        }
        const result = data.results[0];
        return {
            artworkUrl512: result.artworkUrl512,
            screenshotUrls: result.screenshotUrls || [],
            trackName: result.trackName,
            sellerName: result.sellerName,
            version: result.version,
            averageUserRating: result.averageUserRating,
            description: result.description
        };
    });
}
