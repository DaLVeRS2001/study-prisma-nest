-- AddForeignKey
ALTER TABLE "Home" ADD CONSTRAINT "Home_realtor_id_fkey" FOREIGN KEY ("realtor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_home_id_fkey" FOREIGN KEY ("home_id") REFERENCES "Home"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_realtor_id_fkey" FOREIGN KEY ("realtor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_home_id_fkey" FOREIGN KEY ("home_id") REFERENCES "Home"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
