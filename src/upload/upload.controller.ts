import { Controller, Post, UseInterceptors, UploadedFiles, UseGuards, BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
    @Post('')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload up to 5 images for an auction' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                images: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary'
                    }
                }
            }
        }
    })
    @UseInterceptors(FilesInterceptor('images', 5, {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            }
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
                return cb(new BadRequestException('Only image files are allowed!'), false);
            }
            cb(null, true);
        }
    }))
    uploadMultipleFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files uploaded');
        }
        
        // Return the URLs corresponding to where the files can be fetched.
        // E.g., if a file is saved as 'uploads/images-123.jpg', the URL path might be '/uploads/images-123.jpg'
        const urls = files.map(f => `/uploads/${f.filename}`);
        
        return {
            success: true,
            message: 'Images uploaded successfully',
            urls: urls
        };
    }
}
