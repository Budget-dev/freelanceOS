/**
 * @file apps/web/lib/firebase/firestore-rest.ts
 * @description Safe Firestore accessor supporting both Firebase Admin SDK and Firestore REST API
 *
 * Ensures server routes never hang when running in environments without
 * Google Cloud ADC service account keys.
 */

import { adminDb, hasAdminCredentials, projectId } from "@/lib/firebase/admin";

export function parseFirestoreValue(val: any): any {
  if (!val) return null;
  if ("stringValue" in val) return val.stringValue;
  if ("integerValue" in val) return parseInt(val.integerValue, 10);
  if ("doubleValue" in val) return parseFloat(val.doubleValue);
  if ("booleanValue" in val) return val.booleanValue;
  if ("timestampValue" in val) return val.timestampValue;
  if ("nullValue" in val) return null;
  if ("mapValue" in val) {
    const mapRes: any = {};
    if (val.mapValue.fields) {
      for (const [k, v] of Object.entries<any>(val.mapValue.fields)) {
        mapRes[k] = parseFirestoreValue(v);
      }
    }
    return mapRes;
  }
  if ("arrayValue" in val) {
    if (!val.arrayValue.values) return [];
    return val.arrayValue.values.map(parseFirestoreValue);
  }
  return null;
}

export function parseFirestoreDoc(doc: any): any {
  if (!doc) return null;
  const id = doc.name ? doc.name.split("/").pop() : undefined;
  const result: any = { id };
  if (doc.fields) {
    for (const [key, valueObj] of Object.entries<any>(doc.fields)) {
      result[key] = parseFirestoreValue(valueObj);
    }
  }
  return result;
}

export function toFirestoreFields(obj: any): any {
  const fields: any = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined) continue;
    fields[key] = toFirestoreValue(val);
  }
  return fields;
}

function toFirestoreValue(val: any): any {
  if (val === null) return { nullValue: null };
  if (typeof val === "string") return { stringValue: val };
  if (typeof val === "boolean") return { booleanValue: val };
  if (typeof val === "number") {
    if (Number.isInteger(val)) return { integerValue: val.toString() };
    return { doubleValue: val };
  }
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === "object") {
    return { mapValue: { fields: toFirestoreFields(val) } };
  }
  return { stringValue: String(val) };
}

/**
 * Fetch all documents in a collection with timeout and REST fallback
 */
export async function getCollectionDocs(collectionPath: string, idToken?: string): Promise<any[]> {
  // 1. If Admin SDK has credentials, use adminDb with timeout guard
  if (hasAdminCredentials()) {
    try {
      const snap = await Promise.race([
        adminDb.collection(collectionPath).get(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("AdminDb timeout")), 2000)
        ),
      ]);
      return (snap as any).docs.map((d: any) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.warn(`[FirestoreSafe] adminDb failed for ${collectionPath}, falling back to REST:`, err);
    }
  }

  // 2. Fallback: Firestore REST API with idToken
  if (idToken) {
    try {
      const res = await fetch(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionPath}?pageSize=300`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
          signal: AbortSignal.timeout(2000),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const docs = data.documents || [];
        return docs.map(parseFirestoreDoc);
      } else {
        console.warn(`[FirestoreSafe] REST query ${collectionPath} failed with status ${res.status}`);
      }
    } catch (restErr) {
      console.warn(`[FirestoreSafe] REST query ${collectionPath} error:`, restErr);
    }
  }

  return [];
}

/**
 * Fetch a single document by path with timeout and REST fallback
 */
export async function getDocumentByPath(docPath: string, idToken?: string): Promise<any | null> {
  if (hasAdminCredentials()) {
    try {
      const doc = await Promise.race([
        adminDb.doc(docPath).get(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("AdminDb timeout")), 2000)
        ),
      ]);
      if ((doc as any).exists) {
        return { id: (doc as any).id, ...(doc as any).data() };
      }
      return null;
    } catch (err) {
      console.warn(`[FirestoreSafe] adminDb failed for doc ${docPath}, falling back to REST:`, err);
    }
  }

  if (idToken) {
    try {
      const res = await fetch(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${docPath}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
          signal: AbortSignal.timeout(2000),
        }
      );
      if (res.ok) {
        const doc = await res.json();
        return parseFirestoreDoc(doc);
      }
    } catch (restErr) {
      console.warn(`[FirestoreSafe] REST getDoc ${docPath} error:`, restErr);
    }
  }

  return null;
}

/**
 * Save or update a single document with timeout and REST fallback
 */
export async function setDocumentByPath(
  docPath: string,
  data: any,
  idToken?: string,
  merge: boolean = true
): Promise<boolean> {
  if (hasAdminCredentials()) {
    try {
      await Promise.race([
        adminDb.doc(docPath).set(data, { merge }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("AdminDb timeout")), 2000)
        ),
      ]);
      return true;
    } catch (err) {
      console.warn(`[FirestoreSafe] adminDb setDoc ${docPath} failed, falling back to REST:`, err);
    }
  }

  if (idToken) {
    try {
      const fields = toFirestoreFields(data);
      // Using PATCH to upsert document
      const res = await fetch(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${docPath}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ fields }),
          signal: AbortSignal.timeout(2000),
        }
      );
      return res.ok;
    } catch (restErr) {
      console.warn(`[FirestoreSafe] REST setDoc ${docPath} error:`, restErr);
    }
  }

  return false;
}
