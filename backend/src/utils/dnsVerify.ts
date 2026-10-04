import dns from "dns";

// TXT ownership proof — `vendoo-verify=<code>` রেকর্ড থাকতে হবে
export const checkTxtVerification = (domain: string, code: string): Promise<boolean> => {
    return new Promise((resolve) => {
        dns.resolveTxt(domain, (err, records) => {
            if (err) {
                resolve(false);
                return;
            }
            const flat = records.flat().map((v) => v.trim());
            const expected = `vendoo-verify=${code}`;
            resolve(flat.includes(expected));
        });
    });
};
