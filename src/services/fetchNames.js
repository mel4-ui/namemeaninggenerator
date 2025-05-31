import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const fetchNames = async () => {
    const user_id = localStorage.getItem("user_id")
    if(!user_id) return [];

    const q = query(
        collection(db, "names"),
        where("user_id", "==", user_id),
        orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    const names = [];

    querySnapshot.forEach((doc) => {
        names.push({ id: doc.id, ...doc.data() });
    })

    return names;
}

export default fetchNames