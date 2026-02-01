import { Injectable } from '@nestjs/common';

@Injectable()
export class SubjectsService {
    getAllSubjects() {
        return [
            { slug: 'javascript', title: 'Javascript' },
            { slug: 'mongodb', title: 'Mongodb' },
        ];
    }
}
